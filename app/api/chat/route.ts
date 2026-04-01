import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Interface para tipar o corpo da requisição (JSON)
interface ChatRequestBody {
    userId: string;
    appId: string;
    message: string;
    threadId?: string;
    macAddress?: string;
    image?: {
        base64: string;
        mimeType: string;
    };
}

// Inicialize o modelo usando a variável de ambiente (garante que existe valor válido)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        // Extraia userId, appId, message, threadId e opcionalmente a imagem do corpo da requisição JSON
        const body: Partial<ChatRequestBody> = await req.json();
        const { userId, appId, message, threadId, macAddress, image } = body;
        const normalizedMessage = typeof message === 'string' ? message.trim() : '';
        const hasValidImage = !!(image && image.base64 && image.mimeType);

        // Validação mínima
        if (!userId || !appId || (!normalizedMessage && !hasValidImage)) {
            return NextResponse.json(
                { error: 'Parâmetros obrigatórios ausentes ou inválidos: userId, appId e ao menos message ou image.' },
                { status: 400 }
            );
        }

        // Busque o documento correspondente ao appId na collection applications para pegar o system_prompt
        const appRef = db.collection('applications').doc(appId);
        const appDoc = await appRef.get();

        // Se não existir, retorne erro 404
        if (!appDoc.exists) {
            return NextResponse.json({ error: 'Aplicação não encontrada.' }, { status: 404 });
        }

        // Tipando os dados recebidos do Firestore (App Specifics)
        const appData = appDoc.data() || {};

        // Novas configurações Nível Aplicação (Descentralizado)
        const appModel = appData.llm_model || 'gemini-2.5-flash';
        const appTemp = appData.temperature !== undefined ? appData.temperature : 0.7;
        const appSystemPrompt = appData.system_prompt || '';

        // Montagem do Pipeline de Contexto:
        // System Prompt = Identidade & Regras do Agente
        let finalSystemInstruction = appSystemPrompt ? `${appSystemPrompt}` : '';

        finalSystemInstruction = finalSystemInstruction.trim();

        // Busque o documento correspondente ao userId na collection users para pegar o token_balance
        let userRef = db.collection('users').doc(userId);
        let userDoc = await userRef.get();
        let targetUserId = userId; // ID de quem vai efetivamente pagar a conta

        // Se não existir na tabela de usuários, verifica se é um MAC/Serial Number de Hardawre
        if (!userDoc.exists) {
            const deviceRef = db.collection('devices').doc(userId);
            const deviceDoc = await deviceRef.get();

            if (deviceDoc.exists) {
                const deviceData = deviceDoc.data();
                if (deviceData?.status === 'active' && deviceData?.linked_user_id) {

                    // --- Início: Dupla Validação por MAC Address ---
                    const dbMacAddress = deviceData.mac_address;

                    if (dbMacAddress) {
                        // Se existir MAC vinculado nativamente, EXIGE macAddress na requisição para comparar
                        if (!macAddress || macAddress !== dbMacAddress) {
                            return NextResponse.json({ error: 'Acesso Negado: Dupla validação falhou (MAC Address Mismatch).' }, { status: 403 });
                        }
                    } else if (macAddress) {
                        // Faz o Pairing Inicial (First Boot Lock)
                        // Se não tem MAC registrado ainda, salva o primeiro MAC que chamar
                        await deviceRef.update({ mac_address: macAddress });
                    } else {
                        // Sem MAC registrado e enviou S/N puro -> Bloquear ou Permitir? 
                        // Permitiremos no momento para retrocompatibilidade, mas pode ser fechado futuramente
                        // return NextResponse.json({ error: 'Acesso Negado: Dispositivo requer vinculação de MAC.' }, { status: 403 });
                    }
                    // --- Fim: Dupla Validação ---

                    // É um Hardware Tecassistiva! Vamos puxar a carteira do verdadeiro dono (Usuário Conta-Mãe)
                    targetUserId = deviceData.linked_user_id;
                    userRef = db.collection('users').doc(targetUserId);
                    userDoc = await userRef.get();
                } else {
                    return NextResponse.json({ error: 'Dispositivo inativo ou sem proprietário vinculado.' }, { status: 403 });
                }
            } else {
                return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
            }
        }

        // Se o dono (Usuario real ou Dono do Hardware) não for achado, bloqueia.
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Proprietário do dispositivo não existe na base.' }, { status: 404 });
        }

        const userData = userDoc.data();
        const currentTokenBalance: number = userData?.token_balance || 0;
        const currentPlan: string = userData?.plan_id || 'none';
        const userProductId: string = userData?.product_id || null;

        // Validação de Produto e Permissões
        if (userProductId) {
            const productRef = db.collection('products').doc(userProductId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                return NextResponse.json({ error: 'Produto associado ao usuário não encontrado.' }, { status: 404 });
            }

            const productData = productDoc.data();
            const productPermissions: string[] = productData?.permissions || [];

            // Verificar se a aplicação está associada ao produto do usuário
            const appProductId = appData.product_id;
            if (appProductId && appProductId !== userProductId) {
                return NextResponse.json({ error: 'Aplicação não autorizada para este produto.' }, { status: 403 });
            }

            // Verificar permissões específicas
            const requiresChat = true; // Chat sempre requer 'chat'
            const requiresImage = !!image; // Se há imagem, requer 'image_recognition'

            if (requiresChat && !productPermissions.includes('chat')) {
                return NextResponse.json({ error: 'Produto não autorizado para chat IA.' }, { status: 403 });
            }

            if (requiresImage && !productPermissions.includes('image_recognition')) {
                return NextResponse.json({ error: 'Produto não autorizado para reconhecimento de imagens.' }, { status: 403 });
            }
        }

        if (currentTokenBalance <= 0) {
            return NextResponse.json(
                { error: 'Saldo insuficiente. Seu token_balance deve ser maior que zero.' },
                { status: 403 }
            );
        }

        // Feature Gate: Bloquear acesso aos modelos "pro" para clientes que não são do Plano Ouro
        if (appModel.includes('pro') && currentPlan !== 'ouro') {
            return NextResponse.json(
                { error: 'Upgrade Required: O Agente selecionado utiliza um raciocínio complexo que exige o Plano Ouro ativo na sua conta.' },
                { status: 403 }
            );
        }

        // Inicialize o modelo dinamicamente usando as configurações específicas da APLICAÇÃO
        const model = genAI.getGenerativeModel({
            model: appModel,
            systemInstruction: finalSystemInstruction || undefined,
            generationConfig: {
                temperature: appTemp
            }
        });

        // ------------------ GERENCIAMENTO DA THREAD (MEMÓRIA) ------------------
        let history: { role: 'user' | 'model'; parts: any[] }[] = [];
        let currentThreadId = threadId;
        let threadRef: admin.firestore.DocumentReference;

        if (currentThreadId) {
            // Tenta recuperar o histórico do Firestore
            threadRef = db.collection('threads').doc(currentThreadId);
            const threadDoc = await threadRef.get();
            if (threadDoc.exists) {
                history = threadDoc.data()?.history || [];
            } else {
                // Caso mandem um threadId que não existe mais, criamos um zerado
                threadRef = db.collection('threads').doc(); // Cria um novo ID
                currentThreadId = threadRef.id;
                history = [];
            }
        } else {
            // Se não veio thread, cria uma ref nova que vai gerar um id
            threadRef = db.collection('threads').doc();
            currentThreadId = threadRef.id;
        }

        // Adiciona a nova mensagem do usuário ao histórico local
        const userParts: any[] = [];

        if (normalizedMessage) {
            userParts.push({ text: normalizedMessage });
        }

        // Se existir uma imagem enviada pelo usuário na nova requisição
        if (hasValidImage && image) {
            if (!normalizedMessage) {
                userParts.push({ text: 'Analise a imagem enviada.' });
            }
            userParts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType
                }
            });
        }

        history.push({
            role: 'user',
            parts: userParts
        });

        // Prepara os parâmetros para enviar todo o histórico montado pro Gemini
        let generateParams: any = { contents: history };

        // Chame o método generateContent
        const result = await model.generateContent(generateParams);
        const response = await result.response;

        // Extraia o texto da resposta e o total de tokens gastos
        const responseText: string = response.text();
        const tokenCount: number = response.usageMetadata?.totalTokenCount || 0;

        // Evitar underflow de token (não permitir saldo negativo)
        if (tokenCount > currentTokenBalance) {
            return NextResponse.json(
                { error: 'Saldo insuficiente para cobrir os tokens desta requisição.' },
                { status: 403 }
            );
        }

        // Atualize o documento do usuário no Firestore:
        // Subtraia o valor de tokens gastos e adicione ao total_spent_tokens
        await userRef.update({
            token_balance: admin.firestore.FieldValue.increment(-tokenCount),
            total_spent_tokens: admin.firestore.FieldValue.increment(tokenCount)
        });

        // Adiciona um novo documento na collection usage_logs
        await db.collection('usage_logs').add({
            userId: targetUserId, // Proprietário logado na transação
            hardwareId: userId !== targetUserId ? userId : null, // Se foi chamado por device, guarda qual maquina gastou
            appId,
            model_name: appModel, // Agora salva qual modelo a Aplicação usou exatamente
            tokens_used: tokenCount,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        const updatedBalance: number = Math.max(0, currentTokenBalance - tokenCount);

        // Salva a resposta da IA no histórico
        history.push({
            role: 'model',
            parts: [{ text: responseText }]
        });

        // Grava a thread (histórico da conversa inteiro) de volta no Firestore
        await threadRef.set({
            userId: targetUserId,
            hardwareId: userId !== targetUserId ? userId : null,
            appId,
            history,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Retorne a resposta e o saldo atualizado junto com a ThreadId
        return NextResponse.json({
            message: responseText,
            threadId: currentThreadId,
            tokens_consumed: tokenCount,
            updated_balance: currentTokenBalance - tokenCount
        });
    } catch (error: Error | any) {
        console.error('Erro na rota de chat:', error);
        return NextResponse.json(
            { error: 'Erro interno no servidor.', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

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
        const { userId, appId, message, threadId, image } = body;

        // Validação mínima
        if (!userId || !appId || !message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Parâmetros obrigatórios ausentes ou inválidos: userId, appId, ou message.' },
                { status: 400 }
            );
        }

        // Busque o documento correspondente ao appId na collection applications para pegar o pre_prompt
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

        // Campos legados de Identidade e Regras Adicionais
        const prePrompt: string = appData.pre_prompt || '';
        const appDescription: string = appData.description || '';

        // Montagem do Pipeline de Contexto:
        // 1. Identidade (System Prompt) -> 2. Descrição (Contexto) -> 3. Regras Especiais (Pre Prompt)
        let finalSystemInstruction = appSystemPrompt ? `${appSystemPrompt}` : '';

        if (appDescription) {
            finalSystemInstruction += finalSystemInstruction ? `\n\n[Contexto da Aplicação]:\n${appDescription}` : `[Contexto da Aplicação]:\n${appDescription}`;
        }
        if (prePrompt) {
            finalSystemInstruction += finalSystemInstruction ? `\n\n[Regras Específicas do App/Bot]:\n${prePrompt}` : `[Regras Específicas do App/Bot]:\n${prePrompt}`;
        }

        finalSystemInstruction = finalSystemInstruction.trim();

        // Busque o documento correspondente ao userId na collection users para pegar o token_balance
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        // Se não existir ou o saldo for <= 0, retorne erro 403 (Saldo insuficiente)
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        const userData = userDoc.data();
        const currentTokenBalance: number = userData?.token_balance || 0;

        if (currentTokenBalance <= 0) {
            return NextResponse.json(
                { error: 'Saldo insuficiente. Seu token_balance deve ser maior que zero.' },
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
        const userMsgPart: any = { text: message };

        // Se existir uma imagem enviada pelo usuário na nova requisição
        if (image && image.base64 && image.mimeType) {
            userMsgPart.inlineData = {
                data: image.base64,
                mimeType: image.mimeType
            };
        }

        history.push({
            role: 'user',
            parts: [userMsgPart]
        });

        // Prepara os parâmetros para enviar todo o histórico montado pro Gemini
        let generateParams: any = { contents: history };

        // Chame o método generateContent
        const result = await model.generateContent(generateParams);
        const response = await result.response;

        // Extraia o texto da resposta e o total de tokens gastos
        const responseText: string = response.text();
        const tokenCount: number = response.usageMetadata?.totalTokenCount || 0;

        // Atualize o documento do usuário no Firestore: 
        // Subtraia o valor de tokens gastos e adicione ao total_spent_tokens
        await userRef.update({
            token_balance: admin.firestore.FieldValue.increment(-tokenCount),
            total_spent_tokens: admin.firestore.FieldValue.increment(tokenCount)
        });

        // Adiciona um novo documento na collection usage_logs
        await db.collection('usage_logs').add({
            userId,
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
            userId,
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

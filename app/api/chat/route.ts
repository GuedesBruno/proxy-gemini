import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Interface para tipar o corpo da requisição (JSON)
interface ChatRequestBody {
    userId: string;
    appId: string;
    message: string;
}

// Inicialize o modelo usando a variável de ambiente (garante que existe valor válido)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        // Extraia userId, appId e message do corpo da requisição JSON
        const body: Partial<ChatRequestBody> = await req.json();
        const { userId, appId, message } = body;

        // Verificação de segurança de tipos
        if (!userId || !appId || !message) {
            return NextResponse.json(
                { error: 'Parâmetros obrigatórios ausentes: userId, appId, ou message.' },
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

        // Tipando os dados recebidos do Firestore
        const appData = appDoc.data();
        const prePrompt: string = appData?.pre_prompt || '';

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

        // Inicialize o modelo gemini-2.0-flash e passe o pre_prompt como systemInstruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: prePrompt || undefined,
        });

        // Chame o método generateContent(message)
        const result = await model.generateContent(message);
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

        const updatedBalance: number = Math.max(0, currentTokenBalance - tokenCount);

        // Retorne contendo: a mensagem do Gemini, a quantidade de tokens consumidos e o saldo atualizado.
        return NextResponse.json({
            message: responseText,
            tokens_consumed: tokenCount,
            updated_balance: updatedBalance,
        }, { status: 200 });

    } catch (error: Error | any) {
        console.error('Erro na rota de chat:', error);
        return NextResponse.json(
            { error: 'Erro interno no servidor.', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

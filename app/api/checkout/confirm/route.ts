import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId } = body;

        // Recupera o ID do usuário diretamente do cookie de sessão gerado no Login
        const sessionUserId = req.cookies.get('session_userId')?.value;

        if (!sessionUserId) {
            console.error('[Checkout Confirm] ERRO: session_userId não encontrado nos cookies da requisição.');
            return NextResponse.json(
                { error: 'Não autorizado. Faça login novamente.' },
                { status: 401 }
            );
        }

        if (!planId) {
            console.error('[Checkout Confirm] ERRO: planId vazio no payload da requisição JSON.');
            return NextResponse.json(
                { error: 'Parâmetro planId é obrigatório.' },
                { status: 400 }
            );
        }

        const planRef = db.collection('plans').doc(planId);
        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            console.error(`[Checkout Confirm] ERRO FIRESTORE: Plano com ID [${planId}] não encontrado na collection 'plans'.`);
            return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
        }

        const tokensToAdd = Number(planDoc.data()?.tokens || 0);
        const planName = planDoc.data()?.name || 'Desconhecido';

        const userRef = db.collection('users').doc(sessionUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error(`[Checkout Confirm] ERRO FIRESTORE: Utilizador com ID [${sessionUserId}] não encontrado na collection 'users'.`);
            return NextResponse.json({ error: 'Utilizador não encontrado no banco de dados.' }, { status: 404 });
        }

        try {
            // Atualizar o documento do usuário atomicamente
            await userRef.update({
                token_balance: admin.firestore.FieldValue.increment(tokensToAdd),
                current_plan: planName,
                plan_id: planId
            });
            console.log(`[Checkout Confirm] SUCESSO: ${tokensToAdd} tokens adicionados ao usuário ${sessionUserId}. Novo plano: ${planName}.`);
        } catch (updateError: any) {
            console.error(`[Checkout Confirm] ERRO DE TRANSAÇÃO: Falha ao executar o .update() no Firestore para o usuário ${sessionUserId}.`, updateError);
            throw updateError;
        }

        return NextResponse.json({
            message: 'Assinatura confirmada e tokens adicionados com sucesso',
            success: true
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao confirmar checkout:', error);
        return NextResponse.json(
            { error: 'Falha ao processar confirmação', details: error.message },
            { status: 500 }
        );
    }
}

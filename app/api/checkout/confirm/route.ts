import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, planId } = body;

        if (!userId || !planId) {
            return NextResponse.json(
                { error: 'Parâmetros userId e planId são obrigatórios.' },
                { status: 400 }
            );
        }

        const planRef = db.collection('plans').doc(planId);
        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
        }

        const tokensToAdd = planDoc.data()?.tokens;
        const planName = planDoc.data()?.name;

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
        }

        // Atualizar o documento do usuário
        await userRef.update({
            token_balance: admin.firestore.FieldValue.increment(tokensToAdd),
            current_plan: planName,
            plan_id: planId
        });

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

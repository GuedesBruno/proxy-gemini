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

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
        }

        const planRef = db.collection('plans').doc(planId);
        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
        }

        const tokensToAdd = planDoc.data()?.tokens;

        const orderData = {
            userId,
            planId,
            status: 'ativo', // Simulação direta de Gateway
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            price: planDoc.data()?.price,
            tokens: tokensToAdd,
            planName: planDoc.data()?.name
        };

        const batch = db.batch();

        // 1. Cria o registro de ordem aprovada
        const orderRef = db.collection('orders').doc();
        batch.set(orderRef, orderData);

        // 2. Atualiza os saldos e o plano do Utilizador
        batch.update(userRef, {
            token_balance: admin.firestore.FieldValue.increment(tokensToAdd),
            plan_id: planId
        });

        await batch.commit();

        const checkoutUrl = `/checkout/sucesso?orderId=${orderRef.id}`;

        return NextResponse.json({
            message: 'Checkout iniciado com sucesso',
            checkoutUrl,
            orderId: orderRef.id
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao iniciar checkout:', error);
        return NextResponse.json(
            { error: 'Falha ao processar checkout', details: error.message },
            { status: 500 }
        );
    }
}

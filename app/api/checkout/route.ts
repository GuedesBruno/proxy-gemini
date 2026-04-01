import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

const PLAN_ID_ALIASES: Record<string, string[]> = {
    bronze: ['bronze'],
    prata: ['prata', 'silver'],
    silver: ['silver', 'prata'],
    ouro: ['ouro', 'gold'],
    gold: ['gold', 'ouro']
};

const getCandidatePlanIds = (planId: string) => {
    const normalized = String(planId || '').trim().toLowerCase();
    return PLAN_ID_ALIASES[normalized] || [normalized];
};

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

        const candidatePlanIds = getCandidatePlanIds(planId);
        let resolvedPlanDoc: FirebaseFirestore.DocumentSnapshot | null = null;

        for (const candidateId of candidatePlanIds) {
            const candidateDoc = await db.collection('plans').doc(candidateId).get();
            if (candidateDoc.exists) {
                resolvedPlanDoc = candidateDoc;
                break;
            }
        }

        if (!resolvedPlanDoc) {
            return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
        }

        const planData = resolvedPlanDoc.data() || {};
        const resolvedPlanId = resolvedPlanDoc.id;
        const tokensToAdd = Number(planData.tokens || 0);

        if (!Number.isFinite(tokensToAdd) || tokensToAdd <= 0) {
            return NextResponse.json({ error: 'Plano inválido para assinatura. Tokens não definidos.' }, { status: 400 });
        }

        const orderData = {
            userId,
            planId: resolvedPlanId,
            status: 'ativo', // Simulação direta de Gateway
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            price: planData.price,
            tokens: tokensToAdd,
            planName: planData.name
        };

        const batch = db.batch();

        // 1. Cria o registro de ordem aprovada
        const orderRef = db.collection('orders').doc();
        batch.set(orderRef, orderData);

        // 2. Atualiza os saldos e o plano do Utilizador
        batch.update(userRef, {
            token_balance: admin.firestore.FieldValue.increment(tokensToAdd),
            plan_id: resolvedPlanId
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

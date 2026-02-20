import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Parâmetro userId é obrigatório na query string.' },
                { status: 400 }
            );
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
        }

        const userData = userDoc.data();

        // Encontrar o plano ativo ou assinatura
        const ordersRef = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'ativo')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        let currentPlanName = 'Gratuito';

        if (!ordersRef.empty) {
            currentPlanName = ordersRef.docs[0].data().planName || 'Gratuito';
        }

        return NextResponse.json({
            token_balance: userData?.token_balance || 0,
            total_spent_tokens: userData?.total_spent_tokens || 0,
            current_plan: currentPlanName
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao buscar detalhes da assinatura:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar detalhes da assinatura', details: error.message },
            { status: 500 }
        );
    }
}

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
        // Removido o .orderBy() e .limit(1) para evitar a exigência de um Composite Index no Firestore,
        // já que um usuário terá tipicamente no máximo 1 pedido ativo ao mesmo tempo.
        const ordersRef = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'ativo')
            .get();

        let currentPlanName = userData?.plan_id && userData.plan_id !== 'none'
            ? userData.plan_id
            : 'Gratuito';

        // Todos os planos são mensais (30 dias). Calcular base a partir de hoje se as Orders não especificarem.
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 30);
        const day = String(baseDate.getDate()).padStart(2, '0');
        const month = String(baseDate.getMonth() + 1).padStart(2, '0');
        const year = baseDate.getFullYear();

        let renewalDate = `${day}/${month}/${year}`;
        let paymentMethod = 'Atribuído Manualmente (Admin)';

        if (!ordersRef.empty) {
            const activeOrders = ordersRef.docs.map(doc => doc.data());

            // Ordenar em memória (descending) pelo createdAt
            activeOrders.sort((a, b) => {
                const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return dateB - dateA;
            });

            currentPlanName = activeOrders[0].planName || currentPlanName;
            paymentMethod = 'Cartão de Crédito (Gateway)'; // Simulated checkout gateway

            if (activeOrders[0].createdAt && activeOrders[0].createdAt.toMillis) {
                const createdDate = new Date(activeOrders[0].createdAt.toMillis());
                createdDate.setDate(createdDate.getDate() + 30); // Adds 30 days

                // Formata DD/MM/YYYY
                const oDay = String(createdDate.getDate()).padStart(2, '0');
                const oMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
                const oYear = createdDate.getFullYear();

                renewalDate = `${oDay}/${oMonth}/${oYear}`;
            }
        }

        return NextResponse.json({
            token_balance: userData?.token_balance || 0,
            total_spent_tokens: userData?.total_spent_tokens || 0,
            current_plan: currentPlanName,
            renewalDate: renewalDate,
            paymentMethod: paymentMethod
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao buscar detalhes da assinatura:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar detalhes da assinatura', details: error.message },
            { status: 500 }
        );
    }
}

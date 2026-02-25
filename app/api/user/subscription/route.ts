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
            .get();

        let currentPlanName = userData?.plan_id && userData.plan_id !== 'none'
            ? userData.plan_id
            : 'Nenhum';

        let subscriptionDetails: any = {
            orderId: null,
            status: userData?.plan_id && userData.plan_id !== 'none' ? 'ativo' : 'inativo',
            price: 0,
            renewalDate: 'Vitalício / Indeterminado',
            paymentMethod: 'Atribuído Manualmente (Admin)'
        };

        if (!ordersRef.empty) {
            const activeOrders = ordersRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ordenar em memória (descending) pelo createdAt
            activeOrders.sort((a: any, b: any) => {
                const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return dateB - dateA;
            });

            const currentOrder = activeOrders[0] as any;
            currentPlanName = currentOrder.planName || currentPlanName;

            subscriptionDetails.orderId = currentOrder.id;
            subscriptionDetails.status = currentOrder.status;
            subscriptionDetails.price = currentOrder.price || 0;
            subscriptionDetails.paymentMethod = 'Cartão de Crédito (Simulado)';

            if (currentOrder.createdAt && currentOrder.createdAt.toMillis) {
                const createdDate = new Date(currentOrder.createdAt.toMillis());
                createdDate.setDate(createdDate.getDate() + 30); // Adds 30 days

                // Formata DD/MM/YYYY
                const oDay = String(createdDate.getDate()).padStart(2, '0');
                const oMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
                const oYear = createdDate.getFullYear();

                subscriptionDetails.renewalDate = `${oDay}/${oMonth}/${oYear}`;
            }
        }

        return NextResponse.json({
            token_balance: userData?.token_balance || 0,
            total_spent_tokens: userData?.total_spent_tokens || 0,
            current_plan: currentPlanName,
            subscriptionDetails
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao buscar detalhes da assinatura:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar detalhes da assinatura', details: error.message },
            { status: 500 }
        );
    }
}

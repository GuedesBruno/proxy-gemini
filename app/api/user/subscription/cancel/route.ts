import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'Parâmetro userId é obrigatório.' },
                { status: 400 }
            );
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
        }

        const batch = db.batch();

        // 1. Localiza a assinatura ativa na coleção orders
        const ordersRef = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'ativo')
            .get();

        if (!ordersRef.empty) {
            // Cancela todas as ordens ativas caso haja mais de uma por algum bug
            ordersRef.docs.forEach(doc => {
                batch.update(doc.ref, { status: 'cancelado' });
            });
        }

        // 2. Remove o plan_id do usuário, mas MANTÉM os tokens já comprados
        batch.update(userRef, {
            plan_id: 'none'
        });

        await batch.commit();

        return NextResponse.json({
            message: 'Assinatura cancelada com sucesso.'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao cancelar assinatura:', error);
        return NextResponse.json(
            { error: 'Falha ao processar cancelamento', details: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const plansSnapshot = await db.collection('plans').get();
        const plans = plansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(plans, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao buscar planos:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar planos', details: error.message },
            { status: 500 }
        );
    }
}

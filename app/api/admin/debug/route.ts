import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdminAccess } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
    const guard = await requireAdminAccess();
    if (guard) return guard;

    try {
        const bruno = await db.collection('users').where('email', '==', 'brunoguedes@tecassistiva.com.br').get();
        if (bruno.empty) return NextResponse.json({ error: 'Bruno not found' });

        return NextResponse.json({
            size: bruno.size,
            data: bruno.docs.map(d => ({ id: d.id, ...d.data() }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}

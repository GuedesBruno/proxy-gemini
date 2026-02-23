import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settingsRef = db.collection('settings').doc('ai_modules');
        const doc = await settingsRef.get();

        if (!doc.exists) {
            // Return default blueprint if it doesn't exist yet
            return NextResponse.json({
                system_prompt: 'Você é um assistente útil e conciso.',
                persona: 'Assistente Padrão',
                llm_model: 'gemini-2.5-flash',
                temperature: 0.7,
                rate_limit_rps: 10,
                daily_tokens_cap: 1000000
            }, { status: 200 });
        }

        return NextResponse.json(doc.data(), { status: 200 });
    } catch (error: any) {
        console.error('Erro ao buscar configurações globais:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar configurações', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const settingsRef = db.collection('settings').doc('ai_modules');

        // Use merge to only update the fields provided in the body
        await settingsRef.set(body, { merge: true });

        const updatedDoc = await settingsRef.get();
        return NextResponse.json(updatedDoc.data(), { status: 200 });
    } catch (error: any) {
        console.error('Erro ao salvar configurações globais:', error);
        return NextResponse.json(
            { error: 'Falha ao salvar configurações', details: error.message },
            { status: 500 }
        );
    }
}

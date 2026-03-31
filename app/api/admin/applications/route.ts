import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdminAccess } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
    const guard = await requireAdminAccess();
    if (guard) return guard;

    try {
        const appsRef = db.collection('applications');
        const snapshot = await appsRef.get();

        const apps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(apps, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao buscar aplicações:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar aplicações', details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const guard = await requireAdminAccess();
    if (guard) return guard;

    try {
        const body = await req.json();
        const { apps } = body; // Expects { apps: [{ id: 'app1', system_prompt: '...' }, ...] }

        if (!apps || !Array.isArray(apps)) {
            return NextResponse.json({ error: 'Payload de aplicações inválido. Array esperado.' }, { status: 400 });
        }

        const batch = db.batch();

        apps.forEach((app: any) => {
            if (app.id) {
                const appRef = db.collection('applications').doc(app.id);

                const updateData: any = {};
                if (app.description !== undefined) updateData.description = app.description;
                if (app.system_prompt !== undefined) updateData.system_prompt = app.system_prompt;
                if (app.llm_model !== undefined) updateData.llm_model = app.llm_model;
                if (app.temperature !== undefined) updateData.temperature = app.temperature;
                if (app.product_id !== undefined) updateData.product_id = app.product_id;

                if (Object.keys(updateData).length > 0) {
                    batch.update(appRef, updateData);
                }
            }
        });

        await batch.commit();

        return NextResponse.json({ message: 'Aplicações atualizadas com sucesso.' }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao salvar aplicações:', error);
        return NextResponse.json(
            { error: 'Falha ao salvar prompts de aplicativos.', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const guard = await requireAdminAccess();
    if (guard) return guard;

    try {
        const body = await req.json();
        const { id, description, product_id } = body;

        if (!id) {
            return NextResponse.json({ error: 'App ID (id) é obrigatório.' }, { status: 400 });
        }

        const appRef = db.collection('applications').doc(id);
        const appDoc = await appRef.get();

        if (appDoc.exists) {
            return NextResponse.json({ error: 'Um App com este ID já existe.' }, { status: 409 });
        }

        await appRef.set({
            description: description || '',
            system_prompt: '',
            llm_model: 'gemini-2.5-flash',
            temperature: 0.7,
            product_id: product_id || null,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ message: 'Aplicação criada com sucesso.', id }, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao criar aplicação:', error);
        return NextResponse.json(
            { error: 'Falha ao criar aplicativo.', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'App ID (id) é obrigatório para exclusão.' }, { status: 400 });
        }

        const appRef = db.collection('applications').doc(id);
        await appRef.delete();

        return NextResponse.json({ message: 'Aplicação excluída com sucesso.', id }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao excluir aplicação:', error);
        return NextResponse.json(
            { error: 'Falha ao excluir aplicativo.', details: error.message },
            { status: 500 }
        );
    }
}

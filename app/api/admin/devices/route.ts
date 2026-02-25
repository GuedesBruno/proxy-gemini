import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const snapshot = await db.collection('devices').get();
        const devices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(devices, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao listar dispositivos:', error);
        return NextResponse.json({ error: 'Falha ao buscar dispositivos' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { serial_number, linked_user_id, model_name, mac_address } = body;

        if (!serial_number || !linked_user_id) {
            return NextResponse.json({ error: 'Número de série e Cliente vinculado são origatórios.' }, { status: 400 });
        }

        const deviceRef = db.collection('devices').doc(serial_number);
        const deviceDoc = await deviceRef.get();

        if (deviceDoc.exists) {
            return NextResponse.json({ error: 'Este número de série já está cadastrado.' }, { status: 409 });
        }

        await deviceRef.set({
            linked_user_id,
            model_name: model_name || 'Liber Hardware',
            mac_address: mac_address || '',
            status: 'active',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ message: 'Dispositivo cadastrado com sucesso!' }, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao registrar dispositivo:', error);
        return NextResponse.json({ error: 'Falha interna ao cadastrar hardware.' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { serial_number, status, linked_user_id, model_name, mac_address } = body;

        if (!serial_number) {
            return NextResponse.json({ error: 'Número de série (ID) ausente.' }, { status: 400 });
        }

        const deviceRef = db.collection('devices').doc(serial_number);
        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (linked_user_id !== undefined) updateData.linked_user_id = linked_user_id;
        if (model_name !== undefined) updateData.model_name = model_name;
        if (mac_address !== undefined) updateData.mac_address = mac_address;

        await deviceRef.update(updateData);

        return NextResponse.json({ message: 'Dispositivo atualizado com sucesso!' }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao atualizar dispositivo:', error);
        return NextResponse.json({ error: 'Falha interna ao atualizar hardware.' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const serial_number = searchParams.get('id');

        if (!serial_number) {
            return NextResponse.json({ error: 'Número de série (ID) ausente na querystring.' }, { status: 400 });
        }

        await db.collection('devices').doc(serial_number).delete();

        return NextResponse.json({ message: 'Dispositivo desvinculado e excluído com sucesso!' }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao deletar dispositivo:', error);
        return NextResponse.json({ error: 'Falha interna ao excluir hardware.' }, { status: 500 });
    }
}

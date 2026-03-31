import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório para validação.' },
                { status: 400 }
            );
        }

        // A validação de Super Admin de Acesso ao Painel Admin (/admin) ocorre via Middleware.
        // Aqui buscamos a conta na Coleção Users para retornar o UID real do Firestore.

        // 2. Busca o usuário com segurança no backend (Ignora regras de Firebase Client Rules)
        const usersSnapshot = await db.collection('users').where('email', '==', email).get();

        if (usersSnapshot.empty) {
            return NextResponse.json({
                authorized: false,
                error: 'Usuário não encontrado na base de dados do Portal IA - Tecassistiva.'
            }, { status: 404 });
        }

        const userDoc = usersSnapshot.docs[0];

        return NextResponse.json({
            authorized: true,
            firestoreUserId: userDoc.id,
            userData: userDoc.data()
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro na validação do portão:', error);
        return NextResponse.json(
            { error: 'Falha interna ao validar usuário no Gatekeeper.', details: error.message },
            { status: 500 }
        );
    }
}

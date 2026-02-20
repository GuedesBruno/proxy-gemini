import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';
import { sendWelcomeEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao buscar utilizadores:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar utilizadores', details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { userId, amountToAdd, name, email, phone, serialNumber, plan_id } = body;

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

        const updateData: any = {};

        // Caso a requisição seja de top-up de tokens
        if (typeof amountToAdd === 'number') {
            updateData.token_balance = admin.firestore.FieldValue.increment(amountToAdd);
        }

        // Caso a requisição traga atualização de perfil
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
        if (plan_id !== undefined) updateData.plan_id = plan_id;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'Nenhum dado válido fornecido para atualização.' },
                { status: 400 }
            );
        }

        await userRef.update(updateData);

        return NextResponse.json({
            message: 'Utilizador atualizado com sucesso'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao atualizar utilizador:', error);
        return NextResponse.json(
            { error: 'Falha ao atualizar utilizador', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, serialNumber, initialTokens, plan_id, adminEmail } = body;

        // Verifica a permissão Master de criação
        if (adminEmail !== 'bi@tecassistiva.com.br') {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas o e-mail bi@tecassistiva.com.br tem privilégios de criação e disparo do setup na Teca.' },
                { status: 403 }
            );
        }

        if (!email || typeof initialTokens !== 'number') {
            return NextResponse.json(
                { error: 'Parâmetros inválidos. É necessário no mínimo email e initialTokens (número).' },
                { status: 400 }
            );
        }

        const validSerialNumber = serialNumber || 'TECA-' + Math.floor(1000 + Math.random() * 9000);

        try {
            // 1. Cria o Usuário no Firebase Auth usando S/N como senha
            await admin.auth().createUser({
                email: email,
                password: validSerialNumber,
                displayName: name || '',
            });
        } catch (authError: any) {
            console.error('Erro ao criar Auth User:', authError);
            return NextResponse.json(
                { error: 'Falha ao provisionar usuário de Autenticação. Verifique se o e-mail já existe.', details: authError.message },
                { status: 400 }
            );
        }

        // 2. Cria o registro no Firestore da nossa base
        const newUser = {
            name: name || '',
            email,
            phone: phone || '',
            serialNumber: validSerialNumber,
            plan_id: plan_id || 'none',
            token_balance: initialTokens,
            total_spent_tokens: 0
        };

        const docRef = await db.collection('users').add(newUser);

        // 3. Dispara o E-mail de Boas Vindas via Resend (assíncrono para o cliente mas esperamos a resposta do Resend por segurança)
        const emailStatus = await sendWelcomeEmail(email, name || 'Usuário', validSerialNumber);

        if (!emailStatus.success) {
            console.warn(`Usuário ${email} criado, porém a notificação de Welcome falhou.`);
        }

        return NextResponse.json({
            message: 'Utilizador criado com sucesso',
            user: {
                id: docRef.id,
                ...newUser
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Erro ao criar utilizador:', error);
        return NextResponse.json(
            { error: 'Falha ao criar utilizador', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'Parâmetro userId é obrigatório para eliminação.' },
                { status: 400 }
            );
        }

        await db.collection('users').doc(userId).delete();

        return NextResponse.json({
            message: 'Utilizador deletado com sucesso'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao deletar utilizador:', error);
        return NextResponse.json(
            { error: 'Falha ao deletar utilizador', details: error.message },
            { status: 500 }
        );
    }
}

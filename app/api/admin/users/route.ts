import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';
import { sendWelcomeEmail } from '@/lib/mail';
import { requireAdminAccess } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
    const guard = await requireAdminAccess();
    if (guard) return guard;

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
    const guard = await requireAdminAccess();
    if (guard) return guard;

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

        // Caso a requisição seja de atualização absoluta de tokens
        if (typeof body.set_balance === 'number') {
            updateData.token_balance = body.set_balance;
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

        const updatedDoc = await userRef.get();

        return NextResponse.json({
            message: 'Utilizador atualizado com sucesso',
            new_balance: updatedDoc.data()?.token_balance || 0
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
        const { name, email, phone, serialNumber, initialTokens, plan_id } = body;

        // validação de permissão agora via role admin/superadmin no cookie.
        const guard = await requireAdminAccess();
        if (guard) return guard;

        if (!email || typeof initialTokens !== 'number') {
            return NextResponse.json(
                { error: 'Parâmetros inválidos. É necessário no mínimo email e initialTokens (número).' },
                { status: 400 }
            );
        }

        let validSerialNumber = serialNumber || 'TECA-' + Math.floor(1000 + Math.random() * 9000);

        // Firebase Auth REQUIRES absolute minimum 6 characters for a password
        if (validSerialNumber.length < 6) {
            validSerialNumber = validSerialNumber.padStart(6, '0');
        }

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
                { error: `Falha ao provisionar usuário de Autenticação. Motivo: ${authError.message}` },
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
    const guard = await requireAdminAccess();
    if (guard) return guard;

    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'Parâmetro userId é obrigatório para eliminação.' },
                { status: 400 }
            );
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData && userData.email) {
                try {
                    // Get user from Auth by email
                    const authUser = await admin.auth().getUserByEmail(userData.email);
                    // Delete from Auth
                    await admin.auth().deleteUser(authUser.uid);
                    console.log(`Deletado Auth App User: ${userData.email}`);
                } catch (authErr: any) {
                    // If user is not found in auth it might have been manually deleted, just proceed to delete db record
                    console.warn(`Aviso de deleção Auth: O email ${userData.email} não foi encontrado/deletado. Mensagem: ${authErr.message}`);
                }
            }
        }

        await userRef.delete();

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

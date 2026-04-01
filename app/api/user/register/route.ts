import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

const PLAN_ID_ALIASES: Record<string, string[]> = {
    bronze: ['bronze'],
    prata: ['prata', 'silver'],
    silver: ['silver', 'prata'],
    ouro: ['ouro', 'gold'],
    gold: ['gold', 'ouro']
};

const resolvePlanIds = (planId: string) => {
    const normalized = String(planId || '').trim().toLowerCase();
    return PLAN_ID_ALIASES[normalized] || [normalized];
};

const findPlanById = async (planId: string) => {
    const candidates = resolvePlanIds(planId);

    for (const id of candidates) {
        const doc = await db.collection('plans').doc(id).get();
        if (doc.exists) {
            return doc;
        }
    }

    return null;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            email,
            password,
            productId,
            serialNumber,
            planId
        } = body || {};

        if (!email || !password || !productId || !serialNumber) {
            return NextResponse.json(
                { error: 'Campos obrigatorios: email, password, productId e serialNumber.' },
                { status: 400 }
            );
        }

        if (String(password).length < 6) {
            return NextResponse.json(
                { error: 'A senha precisa ter no minimo 6 caracteres.' },
                { status: 400 }
            );
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedSerial = String(serialNumber).trim().toUpperCase();
        const normalizedProduct = String(productId).trim();

        const productDoc = await db.collection('products').doc(normalizedProduct).get();
        if (!productDoc.exists) {
            return NextResponse.json({ error: 'Produto selecionado nao encontrado.' }, { status: 404 });
        }

        const existingUserByEmail = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
        if (!existingUserByEmail.empty) {
            return NextResponse.json({ error: 'Ja existe uma conta com este e-mail.' }, { status: 409 });
        }

        const existingDevice = await db.collection('devices').doc(normalizedSerial).get();
        if (existingDevice.exists) {
            return NextResponse.json({ error: 'Este Serial Number ja esta vinculado no sistema.' }, { status: 409 });
        }

        let authUser;
        try {
            authUser = await admin.auth().createUser({
                email: normalizedEmail,
                password: String(password),
                displayName: String(name || '').trim() || undefined
            });
        } catch (authError: unknown) {
            const message = authError instanceof Error ? authError.message : 'Falha ao criar autenticacao.';
            return NextResponse.json({ error: message }, { status: 400 });
        }

        let planDoc: FirebaseFirestore.DocumentSnapshot | null = null;
        if (planId && String(planId).trim() !== 'none') {
            planDoc = await findPlanById(String(planId));
            if (!planDoc) {
                return NextResponse.json({ error: 'Plano selecionado nao encontrado.' }, { status: 404 });
            }
        }

        const planData = planDoc?.data() || {};
        const tokensFromPlan = Number(planData.tokens || 0);
        const hasPlan = !!planDoc;

        const batch = db.batch();
        const userRef = db.collection('users').doc();

        batch.set(userRef, {
            name: String(name || '').trim() || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            phone: '',
            serialNumber: normalizedSerial,
            plan_id: hasPlan ? planDoc?.id : 'none',
            product_id: normalizedProduct,
            role: 'user',
            token_balance: hasPlan ? tokensFromPlan : 0,
            total_spent_tokens: 0,
            createdAt: new Date().toISOString(),
            firebase_uid: authUser.uid
        });

        batch.set(db.collection('devices').doc(normalizedSerial), {
            linked_user_id: userRef.id,
            model_name: productDoc.data()?.name || 'Tecassistiva Hardware',
            status: hasPlan ? 'active' : 'inactive',
            createdAt: new Date().toISOString()
        });

        if (hasPlan) {
            const orderRef = db.collection('orders').doc();
            batch.set(orderRef, {
                userId: userRef.id,
                planId: planDoc?.id,
                status: 'ativo',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                price: planData.price || 0,
                tokens: tokensFromPlan,
                planName: planData.name || ''
            });
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: 'Conta criada com sucesso.',
            userId: userRef.id,
            subscribed: hasPlan
        }, { status: 201 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Erro no cadastro publico:', message);
        return NextResponse.json(
            { error: 'Falha interna ao criar conta.', details: message },
            { status: 500 }
        );
    }
}

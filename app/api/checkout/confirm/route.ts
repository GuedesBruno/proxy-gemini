import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

const PLAN_ID_ALIASES: Record<string, string[]> = {
    bronze: ['bronze'],
    prata: ['prata', 'silver'],
    silver: ['silver', 'prata'],
    ouro: ['ouro', 'gold'],
    gold: ['gold', 'ouro']
};

const getCandidatePlanIds = (planId: string) => {
    const normalized = String(planId || '').trim().toLowerCase();
    return PLAN_ID_ALIASES[normalized] || [normalized];
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, userId } = body;

        // Recupera o ID do usuário diretamente do cookie de sessão gerado no Login
        const sessionUserId = req.cookies.get('session_userId')?.value || userId;

        if (!sessionUserId) {
            console.error('[Checkout Confirm] ERRO: session_userId não encontrado nos cookies da requisição.');
            return NextResponse.json(
                { error: 'Não autorizado. Faça login novamente para concluir a assinatura.' },
                { status: 401 }
            );
        }

        if (!planId) {
            console.error('[Checkout Confirm] ERRO: planId vazio no payload da requisição JSON.');
            return NextResponse.json(
                { error: 'Parâmetro planId é obrigatório.' },
                { status: 400 }
            );
        }

        const candidatePlanIds = getCandidatePlanIds(planId);
        let resolvedPlanDoc: FirebaseFirestore.DocumentSnapshot | null = null;

        for (const candidateId of candidatePlanIds) {
            const candidateDoc = await db.collection('plans').doc(candidateId).get();
            if (candidateDoc.exists) {
                resolvedPlanDoc = candidateDoc;
                break;
            }
        }

        if (!resolvedPlanDoc) {
            console.error(`[Checkout Confirm] ERRO FIRESTORE: Plano com ID [${planId}] não encontrado na collection 'plans'.`);
            return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
        }

        const planData = resolvedPlanDoc.data() || {};
        const resolvedPlanId = resolvedPlanDoc.id;
        const tokensToAdd = Number(planData.tokens || 0);
        const planName = String(planData.name || 'Desconhecido');

        if (!Number.isFinite(tokensToAdd) || tokensToAdd <= 0) {
            console.error(`[Checkout Confirm] ERRO DE DADOS: Plano ${planId} sem quantidade de tokens válida.`);
            return NextResponse.json({ error: 'Plano inválido para assinatura. Tokens não definidos.' }, { status: 400 });
        }

        const userRef = db.collection('users').doc(sessionUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error(`[Checkout Confirm] ERRO FIRESTORE: Utilizador com ID [${sessionUserId}] não encontrado na collection 'users'.`);
            return NextResponse.json({ error: 'Utilizador não encontrado no banco de dados.' }, { status: 404 });
        }

        try {
            // Atualizar o documento do usuário atomicamente
            await userRef.update({
                token_balance: admin.firestore.FieldValue.increment(tokensToAdd),
                current_plan: planName,
                plan_id: resolvedPlanId
            });
            console.log(`[Checkout Confirm] SUCESSO: ${tokensToAdd} tokens adicionados ao usuário ${sessionUserId}. Novo plano: ${planName}.`);
        } catch (updateError: any) {
            console.error(`[Checkout Confirm] ERRO DE TRANSAÇÃO: Falha ao executar o .update() no Firestore para o usuário ${sessionUserId}.`, updateError);
            throw updateError;
        }

        return NextResponse.json({
            message: 'Assinatura confirmada e tokens adicionados com sucesso',
            success: true
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao confirmar checkout:', error);
        return NextResponse.json(
            { error: 'Falha ao processar confirmação', details: error.message },
            { status: 500 }
        );
    }
}

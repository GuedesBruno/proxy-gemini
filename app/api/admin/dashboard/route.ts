import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const usageLogsSnapshot = await db.collection('usage_logs').get();

        const totalRequests = usageLogsSnapshot.size;
        let totalTokens = 0;

        // Armazena tokens por dia para o gráfico de linha
        const dailyTokens: Record<string, number> = {};

        // Armazena tokens por usuário para o gráfico de barras
        const userTokens: Record<string, number> = {};

        usageLogsSnapshot.forEach(doc => {
            const data = doc.data();
            const tokensUsed = data.tokens_used || 0;
            totalTokens += tokensUsed;

            let dateStr = '';

            // Verifica se timestamp existe e tem o método toDate do Firestore
            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                const dateObj = data.timestamp.toDate();
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                dateStr = `${day}/${month}`;
            } else {
                // Se não existir timestamp válido, usa a data atual
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                dateStr = `${day}/${month}`;
            }

            if (!dailyTokens[dateStr]) {
                dailyTokens[dateStr] = 0;
            }
            dailyTokens[dateStr] += tokensUsed;

            // Agrupamento por usuário
            const userId = data.userId || 'Desconhecido';
            if (!userTokens[userId]) {
                userTokens[userId] = 0;
            }
            userTokens[userId] += tokensUsed;
        });

        // Calcula custo estimado (formata com 4 casas decimais)
        const estimatedCostNumber = totalTokens * 0.00001;
        const estimatedCost = estimatedCostNumber.toFixed(4);

        // Mapeia o objeto de volta para o array sugerido: [{ date: '20/02', tokens: 1500 }]
        const chartData = Object.keys(dailyTokens).map(date => ({
            date,
            tokens: dailyTokens[date]
        }));

        // Transforma o agrupamento de usuários em array ordenado do maior para o menor
        const userUsageData = Object.keys(userTokens)
            .map(name => ({
                name,
                tokens: userTokens[name]
            }))
            .sort((a, b) => b.tokens - a.tokens); // Decrescente

        // Opcional: ordenar cronologicamente pelo dia/mês extraído da string, 
        // ou você pode só deixar a ordem em que foram iterados
        // chartData.sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            totalRequests,
            totalTokens,
            estimatedCost,
            chartData,
            userUsageData
        }, { status: 200 });

    } catch (error: any) {
        console.error('Erro na rota do dashboard:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar os dados do dashboard.', details: error.message },
            { status: 500 }
        );
    }
}

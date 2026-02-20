'use client';

import { useState, useEffect } from 'react';
import { Zap, Package, ShieldCheck, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserSubscription {
    token_balance: number;
    total_spent_tokens: number;
    current_plan: string;
}

interface Plan {
    id: string;
    name: string;
    tokens: number;
    price: number;
}

export default function ClientDashboard() {
    const router = useRouter();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

    // Mock UserID para efeitos de demonstração até ter o Login Auth implementado
    const LOGGED_ID = "vS3U52B3pW0L5G1Eszh4";
    const LOGGED_EMAIL = "bi@tecassistiva.com.br"; // Visual info

    useEffect(() => {
        async function loadDashboardData() {
            try {
                // 1. Fetch User Data
                const subRes = await fetch(`/api/user/subscription?userId=${LOGGED_ID}`);
                if (subRes.ok) {
                    setSubscription(await subRes.json());
                }

                // 2. Fetch Available Plans
                const plansRes = await fetch('/api/plans');
                if (plansRes.ok) {
                    // Ordena via tokens em ordem crescente
                    const plansData: Plan[] = await plansRes.json();
                    setPlans(plansData.sort((a, b) => a.tokens - b.tokens));
                }
            } catch (error) {
                console.error("Erro ao carregar dados do painel:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const handleCheckout = async (planId: string) => {
        setCheckoutLoading(planId);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: LOGGED_ID, planId })
            });

            if (!res.ok) throw new Error('Erro ao processar checkout');

            const data = await res.json();

            // Redireciona para sucesso
            if (data.checkoutUrl) {
                router.push(data.checkoutUrl);
            }
        } catch (error) {
            alert('Falha ao iniciar pagamento. Tente novamente.');
            console.error(error);
            setCheckoutLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-slate-50 min-h-screen items-center justify-center space-x-2 text-[#002554]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-medium text-lg">Carregando a sua carteira...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Topbar Simples do Cliente */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#002554] rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">Liber API</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600 hidden sm:block">Olá, {LOGGED_EMAIL}</span>
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex justify-center items-center font-bold text-[#002554] border border-slate-200">
                            {LOGGED_EMAIL.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

                {/* Seção de Resumo da Carteira */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-[#002554]" />
                        Resumo da Conta
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Plano Atual</p>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-7 h-7 text-emerald-500" />
                                <span className="text-3xl font-extrabold text-slate-800 capitalize">{subscription?.current_plan || 'Nenhum'}</span>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-xl border border-[#002554]/10 flex flex-col justify-center">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Saldo de Tokens</p>
                            <div className="flex items-center gap-2 text-[#002554]">
                                <Zap className="w-7 h-7" />
                                <span className="text-3xl font-extrabold">{(subscription?.token_balance || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Histórico Gasto</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-700">{(subscription?.total_spent_tokens || 0).toLocaleString()}</span>
                                <span className="text-sm font-medium text-slate-500">tokens</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção Call-to-Action Planos */}
                <section className="bg-gradient-to-r from-[#002554] to-blue-900 rounded-3xl p-10 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h2 className="text-3xl font-extrabold tracking-tight mb-3">Obter Mais Tokens da IA</h2>
                        <p className="text-blue-100 text-lg">Faça o upgrade da sua carteira de requisições de Inteligência Artificial instantaneamente escolhendo os pacotes Bronze, Prata ou Ouro.</p>
                    </div>
                    <div className="shrink-0">
                        <button
                            onClick={() => router.push('/dashboard/planos')}
                            className="bg-white text-[#002554] hover:bg-slate-50 px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-[0.98] focus:ring-4 focus:ring-white/20"
                        >
                            Ver Planos e Adquirir Tokens
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </section>

            </main>
        </div>
    );
}

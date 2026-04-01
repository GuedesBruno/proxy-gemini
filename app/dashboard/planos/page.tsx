'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle2, Package, Search, Clock, Zap, MessageSquare, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const PLANS = [
    {
        id: 'bronze',
        name: 'Básico',
        tokens: 10000,
        price: 50.00,
        description: 'Ideal para pilotos e validação inicial do produto.',
        features: [
            { text: 'Chat por texto com contexto (thread)', highlight: false },
            { text: 'Análise de imagem sob demanda', highlight: false },
            { text: '10.000 tokens/mês', highlight: true },
            { text: 'Suporte via e-mail em horário comercial', highlight: false }
        ]
    },
    {
        id: 'prata',
        name: 'Intermediário',
        tokens: 30000,
        price: 120.00,
        description: 'Para operação contínua com maior volume de uso.',
        popular: true,
        features: [
            { text: 'Chat por texto com contexto (thread)', highlight: false },
            { text: 'Análise de imagem com prioridade de fila', highlight: true },
            { text: '30.000 tokens/mês', highlight: true },
            { text: 'Suporte prioritário em horário comercial', highlight: true },
            { text: 'Maior estabilidade para uso diário', highlight: false }
        ]
    },
    {
        id: 'ouro',
        name: 'Avançado',
        tokens: 100000,
        price: 350.00,
        description: 'Para ambientes de produção com alta demanda e baixa latência.',
        features: [
            { text: 'Chat por texto com maior throughput', highlight: true },
            { text: 'Análise de imagem em escala (sem suporte a vídeo)', highlight: true },
            { text: '100.000 tokens/mês', highlight: true },
            { text: 'Acompanhamento técnico dedicado', highlight: true },
            { text: 'Prioridade máxima de processamento', highlight: false }
        ]
    }
];

export default function PlansSelection() {
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);

    const normalizePlanId = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'bronze' || normalized === 'básico' || normalized === 'basico') return 'bronze';
        if (normalized === 'prata' || normalized === 'silver' || normalized === 'intermediário' || normalized === 'intermediario') return 'prata';
        if (normalized === 'ouro' || normalized === 'gold' || normalized === 'avançado' || normalized === 'avancado') return 'ouro';
        return normalized;
    };

    useEffect(() => {
        // Obter o loggedId do cookie
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return '';
        };

        const id = getCookie('session_userId');
        if (id) {
            fetch(`/api/user/subscription?userId=${id}`, { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    if (data.current_plan) setCurrentPlan(normalizePlanId(data.current_plan));
                })
                .catch(console.error);
        }
    }, []);

    const handleSelectPlan = (plan: any) => {
        if (currentPlan === plan.id.toLowerCase()) return; // Previne clique se for o ativo

        // Armazenamos a escolha para a rota de checkout resgatar
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Decorações do Fundo */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                <div className="w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            {/* Botão Voltar */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#002554] bg-white/50 hover:bg-white border border-transparent hover:border-slate-200 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm hover:shadow"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Painel
                </button>
            </div>

            {/* Cabeçalho de Vendas */}
            <div className="text-center max-w-3xl mx-auto mb-8 relative z-10 flex flex-col items-center">
                <div className="flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-slate-100 w-16 h-16 mb-4 drop-shadow-sm">
                    <img src="/icon-teca.png" alt="Tecassistiva" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3">
                    Assinatura de <span className="text-[#002554]">Pacotes e Tokens</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium mb-6">
                    Selecione o pacote de tokens ideal para recarregar sua conta de uso no Painel IA - Tecassistiva.
                </p>

                {/* Toggle Mensal / Anual */}
                <div className="relative inline-flex bg-slate-200/60 rounded-full p-1 sm:p-1.5 shadow-inner">
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={`relative z-10 flex items-center justify-center px-6 py-2 rounded-full text-sm font-bold transition-colors ${!isAnnual ? 'text-[#002554] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {!isAnnual && <div className="absolute inset-0 bg-white rounded-full transition-transform" style={{ zIndex: -1 }}></div>}
                        Mensal
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={`relative z-10 flex items-center justify-center px-6 py-2 rounded-full text-sm font-bold transition-colors ${isAnnual ? 'text-[#002554] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {isAnnual && <div className="absolute inset-0 bg-white rounded-full transition-transform" style={{ zIndex: -1 }}></div>}
                        Anual <span className="ml-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase rounded-full tracking-wider font-extrabold">-15%</span>
                    </button>
                </div>
            </div>

            {/* Grid dos Planos Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full z-10 relative">
                {PLANS.map((plan) => {
                    const monthlyPrice = isAnnual ? plan.price * 0.85 : plan.price;
                    const totalAnnual = monthlyPrice * 12;

                    return (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-[2rem] p-6 sm:p-8 flex flex-col relative transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1
                                ${plan.popular ? 'border-2 border-[#002554] shadow-md ring-4 ring-[#002554]/5' : 'border border-slate-200'}
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#002554] text-white px-5 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                                    Mais Escolhido
                                </div>
                            )}

                            <div className="mb-4">
                                <h2 className="text-2xl font-extrabold text-[#002554] mb-1">{plan.name}</h2>
                                <p className="text-slate-500 text-xs sm:text-sm h-10">{plan.description}</p>
                            </div>

                            <div className="mb-6 flex flex-col">
                                <div className="flex items-baseline gap-1.5 text-slate-900">
                                    <span className="text-4xl font-extrabold tracking-tight">R$ {monthlyPrice.toFixed(2).replace('.', ',')}</span>
                                    <span className="text-slate-500 font-medium text-base">/mês</span>
                                </div>
                                {isAnnual ? (
                                    <div className="mt-1 text-xs text-green-600 font-semibold h-4">
                                        Faturado R$ {totalAnnual.toFixed(2).replace('.', ',')} ao ano
                                    </div>
                                ) : (
                                    <div className="mt-1 text-xs text-transparent select-none h-4">Espaçador</div>
                                )}
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 border border-blue-100 shrink-0">
                                <div className="flex items-center gap-2 text-[#002554] mb-0.5">
                                    <Zap className="w-5 h-5 shrink-0" />
                                    <span className="font-extrabold text-lg">{plan.tokens.toLocaleString()} tokens</span>
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold ml-7">Quota Mensal Injetada</span>
                            </div>

                            <ul className="flex-1 space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-amber-500 fill-amber-50' : 'text-[#002554] fill-blue-50'}`} />
                                        <span className={`text-sm ${feature.highlight ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan({ ...plan, billingCycle: isAnnual ? 'annual' : 'monthly', finalPrice: isAnnual ? totalAnnual : plan.price })}
                                disabled={currentPlan === plan.id.toLowerCase()}
                                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002554] mt-auto
                                    ${currentPlan === plan.id.toLowerCase()
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed border-none'
                                        : plan.popular
                                            ? 'bg-[#002554] text-white hover:bg-blue-900 shadow-lg hover:shadow-xl'
                                            : 'bg-white text-[#002554] border-2 border-[#002554]/20 hover:border-[#002554] hover:bg-blue-50'
                                    }
                                `}
                            >
                                {currentPlan === plan.id.toLowerCase() ? 'Seu Plano Atual' : 'Assinar Agora'}
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

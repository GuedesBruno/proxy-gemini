'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Package, Search, Clock, Zap, MessageSquare } from 'lucide-react';
import Image from 'next/image';

const PLANS = [
    {
        id: 'bronze',
        name: 'Bronze',
        tokens: 10000,
        price: 50.00,
        description: 'Ideal para testes de API e projetos embrionários.',
        features: [
            'Acesso total ao chat (Texto)',
            'Geração de 10.000 tokens',
            'Suporte via e-mail',
            'SLA 99.9% Uptime'
        ]
    },
    {
        id: 'prata',
        name: 'Prata',
        tokens: 30000,
        price: 120.00,
        description: 'Para startups validando produtos e MVP.',
        popular: true,
        features: [
            'Acesso total ao chat (Texto)',
            'Visão computacional (Imagens)',
            'Geração de 30.000 tokens',
            'Suporte Prioritário',
            'SLA 99.9% Uptime'
        ]
    },
    {
        id: 'ouro',
        name: 'Ouro',
        tokens: 100000,
        price: 350.00,
        description: 'Demanda agressiva em produção com multimodalidade em escala.',
        features: [
            'Acesso chat (Texto)',
            'Visão computacional (Imagens/Vídeos)',
            'Geração de 100.000 tokens',
            'Gerente de Conta Dedicado',
            'SLA 99.9% Uptime'
        ]
    }
];

export default function PlansSelection() {
    const router = useRouter();

    const handleSelectPlan = (plan: any) => {
        // Armazenamos a escolha para a rota de checkout resgatar
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Decorações do Fundo */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                <div className="w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            {/* Cabeçalho de Vendas */}
            <div className="text-center max-w-3xl mx-auto mb-16 relative z-10 flex flex-col items-center">
                <div className="flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-slate-100 w-20 h-20 mb-6 drop-shadow-sm">
                    <img src="/icon-teca.png" alt="Tecassistiva" className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                    Assinatura de <span className="text-[#002554]">Pacotes e Tokens</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Escolha o pacote ideal para abastecer suas aplicações através do gateway seguro LIBER® 2026.AI.
                </p>
            </div>

            {/* Grid dos Planos Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full z-10 relative">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white rounded-[2rem] p-8 sm:p-10 flex flex-col relative transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2
                            ${plan.popular ? 'border-2 border-[#002554] shadow-md ring-4 ring-[#002554]/5' : 'border border-slate-200'}
                        `}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#002554] text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg tracking-wide uppercase">
                                Mais Escolhido
                            </div>
                        )}

                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-[#002554] mb-2">{plan.name}</h2>
                            <p className="text-slate-500 text-sm h-10">{plan.description}</p>
                        </div>

                        <div className="mb-8 pb-8 border-b border-slate-100 flex items-baseline gap-2 text-slate-900">
                            <span className="text-5xl font-extrabold tracking-tight">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                            <span className="text-slate-500 font-medium text-lg">/mês</span>
                        </div>

                        <div className="bg-blue-50/50 rounded-2xl p-4 mb-8 border border-blue-100 shrink-0">
                            <div className="flex items-center gap-2 text-[#002554] mb-1">
                                <Zap className="w-5 h-5" />
                                <span className="font-extrabold text-xl">{plan.tokens.toLocaleString()} tokens</span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold ml-7">Quota Mensal Injetada</span>
                        </div>

                        <ul className="flex-1 space-y-4 mb-8">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#002554] shrink-0 fill-blue-50" />
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSelectPlan(plan)}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002554]
                                ${plan.popular
                                    ? 'bg-[#002554] text-white hover:bg-blue-900 shadow-lg hover:shadow-xl'
                                    : 'bg-white text-[#002554] border-2 border-[#002554]/20 hover:border-[#002554] hover:bg-blue-50'
                                }
                            `}
                        >
                            Assinar Agora
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}

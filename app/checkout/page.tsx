'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, CreditCard, ChevronLeft, Package, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedPlan = localStorage.getItem('selectedPlan');
        if (storedPlan) {
            setPlan(JSON.parse(storedPlan));
        } else {
            router.push('/dashboard/planos');
        }
        setLoading(false);
    }, [router]);

    const handleConfirmPurchase = async () => {
        setProcessing(true);
        try {
            // Integração com a mock API para confirmar a compra
            const res = await fetch('/api/checkout/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: "vS3U52B3pW0L5G1Eszh4", // LOGGED_ID manual/temporário
                    planId: plan.id
                })
            });

            if (!res.ok) throw new Error('Falha no checkout');

            // Limpa o plano armazenado
            localStorage.removeItem('selectedPlan');

            // Transita para estado de sucesso
            setSuccess(true);
        } catch (error) {
            console.error('Erro na compra:', error);
            alert('Falha interna ao processar o pagamento. Tente novamente.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-slate-50 min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#002554]" />
            </div>
        );
    }

    if (!plan && !success) return null;

    // View de Sucesso Requisitada
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center max-w-lg w-full animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Pagamento Aprovado!</h1>
                    <p className="text-slate-600 mb-8 text-lg">
                        Parabéns! O saldo da sua carteira foi atualizado e a sua assinatura do plano <strong className="text-slate-900">{plan?.name}</strong> está ativa.
                    </p>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex w-full justify-center items-center bg-[#002554] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-md active:scale-95"
                    >
                        Voltar ao Início
                    </button>

                    <p className="mt-6 text-xs text-slate-400 font-medium">Os tokens foram creditados instantaneamente. Ambiente seguro Tecassistiva.</p>
                </div>
            </div>
        );
    }

    // View Principal de Checkout
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">

            <div className="w-full max-w-4xl mb-8">
                <Link href="/dashboard/planos" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#002554] transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trocar de Plano
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col md:flex-row max-w-4xl w-full">

                {/* 1. Resumo da Compra */}
                <div className="p-8 md:p-10 md:w-[55%] bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
                    <h2 className="text-sm font-extrabold tracking-widest text-slate-400 uppercase mb-8 flex items-center gap-2">
                        <Package className="w-5 h-5 text-slate-400" />
                        Resumo do Pedido
                    </h2>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-extrabold text-[#002554]">Plano {plan.name}</h3>
                                <p className="text-slate-500 text-sm mt-1">Assinatura Mensal Recorrente</p>
                            </div>
                            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-2 truncate max-w-[140px]">
                                <Zap className="w-5 h-5 text-[#002554] shrink-0" />
                                <span className="font-extrabold text-[#002554] truncate">{plan.tokens.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <ul className="space-y-4 mb-8 text-lg">
                            <li className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-200/60">
                                <span>Subtotal do Pacote</span>
                                <span>R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                            </li>
                            <li className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-200/60">
                                <span>Taxas Administrativas</span>
                                <span className="text-emerald-600 font-bold">R$ 0,00</span>
                            </li>
                        </ul>

                        <div className="flex justify-between items-center bg-[#002554]/5 p-6 rounded-2xl border border-[#002554]/10">
                            <span className="text-xl font-bold text-slate-900">Total a Pagar</span>
                            <span className="text-4xl font-extrabold text-[#002554]">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Forma de Pagamento */}
                <div className="p-8 md:p-10 md:w-[45%] flex flex-col bg-white">
                    <div className="mb-8">
                        <h2 className="text-sm font-extrabold tracking-widest text-[#002554] uppercase mb-8 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Forma de Pagamento
                        </h2>

                        {/* Placeholder Visual de Cartão */}
                        <div className="relative w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden mb-6 flex flex-col justify-between group cursor-not-allowed">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <ShieldCheck className="w-8 h-8 text-white/50" />
                                <div className="flex gap-1">
                                    <div className="w-8 h-5 bg-white/20 rounded"></div>
                                    <div className="w-8 h-5 bg-white/20 rounded"></div>
                                </div>
                            </div>

                            <div className="relative z-10 text-white/30 text-center font-medium font-mono tracking-widest text-lg">
                                SIMU LAÇÃ ODEP AGAM ENTO
                            </div>

                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Titular</div>
                                    <div className="text-sm font-bold text-white/80">AMBIENTE TESTE</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1 text-right">Validade</div>
                                    <div className="text-sm font-bold text-white/80 text-right">12/99</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 font-medium text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                            Para efeito desta demonstração, o pagamento acima não interliga a gate de cartão de crédito. É apenas um Sandbox local.
                        </p>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={handleConfirmPurchase}
                            disabled={processing}
                            className={`w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all shadow-md group text-lg
                                ${processing
                                    ? 'bg-[#002554]/80 text-white cursor-wait shadow-inner'
                                    : 'bg-[#002554] text-white hover:bg-blue-900 hover:shadow-xl focus:ring-4 focus:ring-[#002554]/20 hover:-translate-y-1'
                                }
                            `}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Conectando gateway...
                                </>
                            ) : (
                                'Finalizar Pagamento (Simulação)'
                            )}
                        </button>
                    </div>
                </div>

            </div>

            <div className="mt-8 text-center max-w-2xl px-4">
                <span className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Seus dados estão protegidos por criptografia de ponta a ponta. Plataforma 100% segura.
                </span>
            </div>
        </div>
    );
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg w-full">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Pagamento Confirmado!</h1>
            <p className="text-slate-600 mb-6 text-lg">
                A sua assinatura foi processada com sucesso. Os tokens já foram adicionados à sua carteira de API.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 inline-block">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-1">ID do Pedido</span>
                <span className="font-mono text-slate-800 font-medium">{orderId || 'PROCESSADO_OFFLINE'}</span>
            </div>

            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex w-full justify-center items-center gap-2 bg-[#002554] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-md group"
                >
                    Voltar ao Meu Painel
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-slate-500 animate-pulse">Carregando confirmação...</div>}>
                <CheckoutSuccessContent />
            </Suspense>
        </div>
    );
}

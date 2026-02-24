'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Code, Smartphone } from 'lucide-react';
import { logOut } from '@/lib/auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logOut();
            router.push('/login');
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    return (
        <div className="flex bg-slate-50 font-sans antialiased text-gray-900">
            {/* Sidebar (Fixed on Desktop) */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#002554] text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0">
                {/* Logo / Title Area */}
                <div className="flex items-center gap-3 px-6 py-8">
                    <Image
                        src="/icon-teca.png"
                        alt="Logo Tecassistiva"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <h1 className="text-xl font-bold text-white tracking-wide">
                        LIBER® 2026.AI
                        <br />
                        PAINEL ADMIN
                    </h1>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col flex-grow overflow-y-auto py-6 px-4 space-y-2">

                    <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group">
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link href="/admin/usuarios" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group">
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Usuários
                    </Link>

                    <Link href="/admin/dispositivos" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group">
                        <Smartphone className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" />
                        Equipamentos
                    </Link>

                    <Link href="/admin/apps" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group">
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Aplicações
                    </Link>

                    <Link href="/admin/modulos" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group">
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Módulos IA
                    </Link>

                    <Link href="/admin/api-docs" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group">
                        <Code className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" />
                        Documentação API
                    </Link>

                </div>

                {/* User Info & Logout (Bottom) */}
                <div className="shrink-0 p-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white border border-white/20">
                            A
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Admin</p>
                            <p className="text-xs text-white/50">master</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sair do Painel"
                        className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 bg-slate-50 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex items-center h-20 px-8 bg-white shadow-sm shrink-0">
                    <div className="flex items-center w-full justify-between">
                        <h2 className="text-xl font-medium text-gray-800 tracking-tight">
                            Bem-vindo ao Painel de Controle
                        </h2>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Code, Smartphone, Settings2, Users, Boxes, LayoutGrid, Bot, BookOpen, House, Plus, RefreshCw, type LucideIcon } from 'lucide-react';
import { logOut } from '@/lib/auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const headerConfig: Record<string, { icon: LucideIcon; title: string; subtitle: string }> = {
        '/admin': {
            icon: House,
            title: 'Visão Geral do Painel',
            subtitle: 'Acompanhe os principais indicadores e o status geral da operação.',
        },
        '/admin/usuarios': {
            icon: Users,
            title: 'Gestão de Usuários',
            subtitle: 'Visualize, edite ou recarregue créditos das contas registradas.',
        },
        '/admin/dispositivos': {
            icon: Smartphone,
            title: 'Gestão de Equipamentos',
            subtitle: 'Monitore status, vínculos e disponibilidade dos dispositivos cadastrados.',
        },
        '/admin/produtos': {
            icon: Boxes,
            title: 'Gestão de Produtos',
            subtitle: 'Organize os produtos, defina escopos e mantenha o catálogo atualizado.',
        },
        '/admin/apps': {
            icon: LayoutGrid,
            title: 'Gestão de Aplicações',
            subtitle: 'Configure apps, prompts e integrações disponíveis para cada produto.',
        },
        '/admin/configuracoes-ia': {
            icon: Bot,
            title: 'Configurações de IA',
            subtitle: 'Ajuste modelos, parâmetros e comportamento das respostas inteligentes.',
        },
        '/admin/api-docs': {
            icon: BookOpen,
            title: 'Documentação da API',
            subtitle: 'Consulte endpoints, autenticação e exemplos para integração técnica.',
        },
    };

    const currentHeader = headerConfig[pathname] || {
        icon: House,
        title: 'Painel Admin',
        subtitle: 'Gerencie recursos e configurações da plataforma.',
    };
    const HeaderIcon = currentHeader.icon;

    const handleHeaderAction = (eventName: string) => {
        window.dispatchEvent(new Event(eventName));
    };

    // Função para verificar se o link é ativo
    const isActive = (path: string) => pathname === path;

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
                <div className="flex flex-col items-center gap-4 px-6 py-8 border-b border-white/10">
                    <Image
                        src="/icon-teca.png"
                        alt="Logo Tecassistiva"
                        width={56}
                        height={56}
                        className="object-contain"
                    />
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-white tracking-wide leading-tight">
                            TECASSISTIVA
                        </h1>
                        <p className="text-xs font-semibold text-white/70 tracking-widest mt-1">
                            IA PAINEL
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col flex-grow overflow-y-auto py-6 px-4 space-y-2">

                    <Link href="/admin" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link href="/admin/usuarios" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin/usuarios') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Usuários
                    </Link>

                    <Link href="/admin/dispositivos" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin/dispositivos') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                        <Smartphone className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" />
                        Equipamentos
                    </Link>

                    <Link href="/admin/produtos" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin/produtos') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Produtos
                    </Link>

                    <Link href="/admin/apps" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin/apps') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                        <svg className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Aplicações
                    </Link>

                    <Link href="/admin/configuracoes-ia" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin/configuracoes-ia') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                        <Settings2 className="w-5 h-5 mr-3 text-white/50 group-hover:text-white" />
                        Configurações IA
                    </Link>

                    <Link href="/admin/api-docs" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
                        isActive('/admin/api-docs') 
                            ? 'bg-white/15 text-white border-2 border-white/40' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
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
                <header className="sticky top-0 z-30 px-8 py-4 bg-white shadow-sm shrink-0 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4 w-full">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-lg bg-slate-100 text-slate-700">
                                <HeaderIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                    {currentHeader.title}
                                </h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {currentHeader.subtitle}
                                </p>
                            </div>
                        </div>

                        {pathname === '/admin/usuarios' && (
                            <button
                                onClick={() => handleHeaderAction('admin-users-open-create')}
                                className="hidden md:flex items-center gap-2 bg-[#002554] px-5 py-2.5 rounded-md text-white font-medium shadow-sm hover:bg-blue-900 transition-colors w-fit focus:ring-2 focus:ring-offset-2 focus:ring-[#002554]"
                            >
                                <Plus className="w-5 h-5" />
                                Novo Usuário
                            </button>
                        )}

                        {pathname === '/admin/dispositivos' && (
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => handleHeaderAction('admin-devices-refresh')}
                                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                                    title="Atualizar Tabela"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleHeaderAction('admin-devices-open-create')}
                                    className="flex items-center gap-2 bg-[#002554] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 font-bold transition-all shadow-md active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    Cadastrar Lote / NS
                                </button>
                            </div>
                        )}
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

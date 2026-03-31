'use client';

import { useState } from 'react';
import { signInWithGoogle, loginWithEmail, logOut, dbClient } from '@/lib/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = async () => {
        setLoadingGoogle(true);
        setErrorMsg(null);

        try {
            const authResult = await signInWithGoogle();
            const user = authResult?.user;

            if (!user?.email) {
                await logOut();
                setErrorMsg('Não foi possível obter o e-mail da conta Google.');
                setLoadingGoogle(false);
                return;
            }

            // O gatekeeper já barrou no auth.ts, mas o redirecionamento é aqui
            router.push('/dashboard');

        } catch (error: any) {
            console.error('Falha no processo de autenticação:', error);
            const msg = error.message || 'Falha ao autenticar com o Google. Tente novamente.';
            setErrorMsg(msg.includes('Tecassistiva') ? msg : 'Falha ao autenticar com o Google. Tente novamente.');
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMsg('Por favor, preencha o e-mail e a senha.');
            return;
        }

        setLoadingEmail(true);
        setErrorMsg(null);

        try {
            const authResult = await loginWithEmail(email.trim(), password.trim());
            if (authResult?.user) {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Falha no login com email/senha:', error);
            // Firebase Auth specific errors check (invalid-credential etc)
            let msg = 'E-mail ou senha incorretos.';
            if (error.message && error.message.includes('Tecassistiva')) {
                msg = error.message;
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                msg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
            } else if (error.code === 'auth/too-many-requests') {
                msg = 'Muitas tentativas falhas. Tente novamente mais tarde.';
            }
            setErrorMsg(msg);
        } finally {
            setLoadingEmail(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Decorações sutis de background para compor a marca */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#002554] to-blue-800"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center text-center">
                <img src="/icon-teca.png" alt="Tecassistiva Logo" className="w-20 h-20 object-contain mb-3 drop-shadow-md" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }} />
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">IA Tecassistiva</h1>
                <p className="text-lg font-semibold text-[#002554] -mt-1">Painel Adm</p>
                <p className="text-sm text-slate-500 mt-2">Portal IA - Tecassistiva</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">

                    {errorMsg && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start shadow-sm animate-in zoom-in-95 duration-200">
                            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-600" />
                            <span className="font-semibold text-sm leading-snug">{errorMsg}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <p className="text-sm text-slate-600">
                                O acesso é restrito aos gerentes e clientes da plataforma pre-cadastrados.
                            </p>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#002554] mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@tecassistiva.com.br"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all bg-slate-50 focus:bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#002554] mb-1">Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Digite sua senha"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all bg-slate-50 focus:bg-white font-mono"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loadingEmail || loadingGoogle}
                                className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-all transform active:scale-[0.98] mt-2
                                    ${loadingEmail
                                        ? 'bg-[#002554]/80 cursor-wait shadow-inner'
                                        : 'bg-[#002554] hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-[#002554]/20 hover:shadow-lg'
                                    }
                                `}
                            >
                                {loadingEmail ? (
                                    <span className="flex items-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-3 text-white/80" />
                                        Entrando...
                                    </span>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-slate-400 font-medium">Ou</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            disabled={loadingEmail || loadingGoogle}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white transition-all hover:bg-slate-50 active:scale-[0.98]
                                ${loadingGoogle ? 'opacity-70 cursor-wait' : 'focus:ring-4 focus:ring-slate-100'}
                            `}
                        >
                            {loadingGoogle ? (
                                <span className="flex items-center">
                                    <Loader2 className="w-5 h-5 animate-spin mr-3 text-slate-400" />
                                    Google...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <div className="bg-white p-0.5 rounded-full mr-3 items-center flex justify-center border border-slate-100 shadow-sm">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </div>
                                    Entrar com Google
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white text-slate-400 font-medium">
                                    Tecassistiva • Authentication Gate
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="fixed bottom-4 text-center w-full z-0 pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">© 2026 Tecassistiva</span>
            </div>
        </div>
    );
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Apenas interceptar rotas protegidas (Painel do Cliente e Painel Admin)
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {

        const sessionUserId = request.cookies.get('session_userId')?.value;
        const sessionEmail = request.cookies.get('session_email')?.value;

        // Regra 1: Não logado -> Bate na porta, volta pro /login
        if (!sessionUserId || !sessionEmail) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Regra 2: É logado, mas tentou acessar /admin sendo usuário comum
        if (pathname.startsWith('/admin')) {
            const sessionRole = request.cookies.get('session_role')?.value || 'user';

            if (sessionRole !== 'admin' && sessionRole !== 'superadmin') {
                const dashboardUrl = new URL('/dashboard', request.url);
                return NextResponse.redirect(dashboardUrl);
            }
        }
    }

    // Se passou livre ou não é rota protegida, entrega a página normalmente
    return NextResponse.next();
}

// O matcher define quais paths ativam este middleware para otimizar a performance
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*'
    ],
};

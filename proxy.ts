import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminPage = pathname.startsWith('/admin');
    const isDashboardPage = pathname.startsWith('/dashboard');
    const isTestPage = pathname.startsWith('/test-auth');
    const isAdminApi = pathname.startsWith('/api/admin');
    const isProtectedPath = isDashboardPage || isAdminPage || isTestPage || isAdminApi;

    if (isProtectedPath) {
        const sessionUserId = request.cookies.get('session_userId')?.value;
        const sessionEmail = request.cookies.get('session_email')?.value;

        if (!sessionUserId || !sessionEmail) {
            if (isAdminApi) {
                return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
            }

            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        if (isAdminPage || isTestPage || isAdminApi) {
            const sessionRole = request.cookies.get('session_role')?.value || 'user';

            if (sessionRole !== 'admin' && sessionRole !== 'superadmin') {
                if (isAdminApi) {
                    return NextResponse.json({ error: 'Acesso negado: é necessário permissão de administrador.' }, { status: 403 });
                }

                const dashboardUrl = new URL('/dashboard', request.url);
                return NextResponse.redirect(dashboardUrl);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/test-auth/:path*',
        '/api/admin/:path*'
    ],
};
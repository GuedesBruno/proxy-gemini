import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        const sessionUserId = request.cookies.get('session_userId')?.value;
        const sessionEmail = request.cookies.get('session_email')?.value;

        if (!sessionUserId || !sessionEmail) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        if (pathname.startsWith('/admin')) {
            const sessionRole = request.cookies.get('session_role')?.value || 'user';

            if (sessionRole !== 'admin' && sessionRole !== 'superadmin') {
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
        '/admin/:path*'
    ],
};
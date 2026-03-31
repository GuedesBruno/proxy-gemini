import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function requireAdminAccess() {
    const cookieStore = await cookies();
    const role = cookieStore.get('session_role')?.value || 'user';

    if (role !== 'admin' && role !== 'superadmin') {
        return NextResponse.json(
            { error: 'Acesso negado: é necessário permissão de administrador.' },
            { status: 403 }
        );
    }

    return null;
}

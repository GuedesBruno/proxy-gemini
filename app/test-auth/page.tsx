'use client';
export default function TestLoginPage() {
    return (
        <div style={{ padding: '50px' }}>
            <h1>Test Auth Direct</h1>
            <button onClick={async () => {
                try {
                    const { loginWithEmail } = await import('@/lib/auth');
                    const res = await loginWithEmail('brunoguedes@tecassistiva.com.br', 'LIBER-07');
                    alert('SUCCESS FIREBASE UID: ' + res.user.uid + '  |  FIRESTORE UID: ' + res.firestoreUserId);
                } catch (e: any) {
                    alert('ERROR: ' + e.message);
                }
            }}>Test Direct Login</button>
        </div>
    )
}

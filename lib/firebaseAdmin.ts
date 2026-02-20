import admin from 'firebase-admin';

// Esta verificação impede que o Next.js tente inicializar o Firebase várias vezes durante o desenvolvimento
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o Firebase Admin:', error instanceof Error ? error.stack : error);
    }
}

const db = admin.firestore();

export { db };
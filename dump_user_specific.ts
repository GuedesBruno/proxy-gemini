import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

async function getUserByEmail(email: string) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log('--- USER RECORD ---');
        console.log(JSON.stringify(userRecord.toJSON(), null, 2));
        console.log('-------------------');
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

// Subsitute this with the exact email the user tested
getUserByEmail('bi@tecassistiva.com.br');

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

async function listAllUsers() {
    try {
        const listUsersResult = await admin.auth().listUsers(100);
        console.log('--- FIREBASE AUTH USERS DUMP ---');
        listUsersResult.users.forEach((userRecord) => {
            console.log(`User: ${userRecord.uid} | Email: ${userRecord.email} | Name: ${userRecord.displayName} | ProviderData[0]: ${userRecord.providerData[0]?.providerId}`);
        });
        console.log('--------------------------------');
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

listAllUsers();

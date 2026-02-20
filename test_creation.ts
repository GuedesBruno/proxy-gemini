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

async function testAuth() {
    const email = 'teste123@tecassistiva.com.br';
    const password = 'LIBER-01'; // 8 chars

    try {
        // Drop old if exists
        try {
            const oldUser = await admin.auth().getUserByEmail(email);
            await admin.auth().deleteUser(oldUser.uid);
            console.log('Deleted old test user.');
        } catch (e) { }

        // Create new
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: "Test User",
        });
        console.log(`Created new Test User with UID: ${userRecord.uid} and Password: ${password}`);

        // Try verifying if the password was set exactly as provided by checking providerData
        console.log("Providers: ", userRecord.providerData.map(p => p.providerId).join(', '));

    } catch (error) {
        console.error('Error in test:', error);
    }
}

testAuth();

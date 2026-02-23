import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}
const db = admin.firestore();

async function run() {
    console.log("Searching for: brunoguedes@tecassistiva.com.br");
    const bruno = await db.collection('users').where('email', '==', 'brunoguedes@tecassistiva.com.br').get();

    if (bruno.empty) {
        console.log('BRUNO NOT FOUND IN USERS COLLECTION');
        return;
    }

    console.log(`FOUND ${bruno.size} RECORDS FOR BRUNO:`);
    bruno.docs.forEach(d => {
        console.log(`\n--- DOCUMENT ID: ${d.id} ---`);
        console.log(d.data());
    });
}
run();

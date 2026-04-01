import { db } from './lib/firebaseAdmin';

async function seedPlans() {
    console.log('Seeding plans to Firestore...');
    const plansRef = db.collection('plans');

    await plansRef.doc('bronze').set({ name: 'Básico', tokens: 10000, price: 50 });
    await plansRef.doc('silver').set({ name: 'Intermediário', tokens: 30000, price: 120 });
    await plansRef.doc('gold').set({ name: 'Avançado', tokens: 100000, price: 350 });

    console.log('Plans seeded successfully!');
    process.exit(0);
}

seedPlans().catch(console.error);

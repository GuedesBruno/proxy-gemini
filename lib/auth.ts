import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase SDK Client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const dbClient = getFirestore(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user.email) {
            await signOut(auth);
            throw new Error('E-mail não fornecido pelo Google.');
        }

        // Gatekeeper: Check Firestore for allowed users
        const usersRef = collection(dbClient, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await signOut(auth);
            throw new Error('E-mail não autorizado pela Tecassistiva');
        }

        // Se o usuário existir, capturamos o ID armazenado no Firestore
        const firestoreUserId = querySnapshot.docs[0].id;

        // Salve sessão ativa via cookie para acesso seguro de middleware/RSC (simulação client-side API)
        document.cookie = `session_userId=${firestoreUserId}; path=/; max-age=86400`;
        document.cookie = `session_email=${user.email}; path=/; max-age=86400`;

        return { user, firestoreUserId };
    } catch (error) {
        console.error("Erro no login com Google:", error);
        throw error;
    }
};

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        if (!user.email) {
            await signOut(auth);
            throw new Error('E-mail não fornecido pelo Firebase.');
        }

        // Gatekeeper: Check Firestore for allowed users
        const usersRef = collection(dbClient, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await signOut(auth);
            throw new Error('E-mail não autorizado pela Tecassistiva');
        }

        const firestoreUserId = querySnapshot.docs[0].id;

        // Salve sessão ativa via cookie
        document.cookie = `session_userId=${firestoreUserId}; path=/; max-age=86400`;
        document.cookie = `session_email=${user.email}; path=/; max-age=86400`;

        return { user, firestoreUserId };
    } catch (error) {
        console.error("Erro no login com E-mail:", error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
};

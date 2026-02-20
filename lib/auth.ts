import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';

// Configurações do SDK Client (Usando as chaves do Firebase Console)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase apenas uma vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const dbClient = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

/**
 * Função Auxiliar: Define os cookies de sessão
 */
const setSessionCookies = (userId: string, email: string) => {
    document.cookie = `session_userId=${userId}; path=/; max-age=86400`;
    document.cookie = `session_email=${email}; path=/; max-age=86400`;
};

/**
 * LOGIN COM GOOGLE
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!user.email) {
            await signOut(auth);
            throw new Error('E-mail não fornecido pelo Google.');
        }

        // 1. Verificação de Super Admin (bi@tecassistiva.com.br)
        if (user.email === 'bi@tecassistiva.com.br') {
            setSessionCookies('admin_master', user.email);
            return { user, firestoreUserId: 'admin_master' };
        }

        // 2. Gatekeeper: Busca o usuário na coleção 'users' do Firestore
        const usersRef = collection(dbClient, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await signOut(auth);
            throw new Error('Acesso negado: E-mail não autorizado pela Tecassistiva.');
        }

        const firestoreUserId = querySnapshot.docs[0].id;
        setSessionCookies(firestoreUserId, user.email);

        return { user, firestoreUserId };
    } catch (error: any) {
        console.error("Erro no login com Google:", error.message);
        throw error;
    }
};

/**
 * LOGIN COM E-MAIL E SENHA (S/N DO LIBER)
 */
export const loginWithEmail = async (email: string, serialNumber: string) => {
    try {
        // O Firebase Auth usará o e-mail e o Número de Série (senha) cadastrados pelo Admin
        const result = await signInWithEmailAndPassword(auth, email, serialNumber);
        const user = result.user;

        if (!user.email) {
            await signOut(auth);
            throw new Error('Erro na autenticação.');
        }

        // 1. Verificação de Super Admin
        if (user.email === 'bi@tecassistiva.com.br') {
            setSessionCookies('admin_master', user.email);
            return { user, firestoreUserId: 'admin_master' };
        }

        // 2. Gatekeeper: Valida existência no Firestore
        const usersRef = collection(dbClient, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await signOut(auth);
            throw new Error('Usuário não encontrado na base de dados do LIBER®.');
        }

        const firestoreUserId = querySnapshot.docs[0].id;
        setSessionCookies(firestoreUserId, user.email);

        return { user, firestoreUserId };
    } catch (error: any) {
        console.error("Erro no login com E-mail:", error.message);
        throw error;
    }
};

/**
 * LOGOUT
 */
export const logOut = async () => {
    try {
        await signOut(auth);
        // Limpa os cookies de sessão
        document.cookie = "session_userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "session_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
};
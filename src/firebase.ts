import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function rawEnv(name: string): string {
  return (import.meta.env[name as keyof ImportMeta['env']] as string) || '';
}

function trimVal(v: string): string {
  return v.trim();
}

const firebaseConfig = {
  apiKey: trimVal(rawEnv('VITE_FIREBASE_API_KEY')),
  authDomain: trimVal(rawEnv('VITE_FIREBASE_AUTH_DOMAIN')),
  projectId: trimVal(rawEnv('VITE_FIREBASE_PROJECT_ID')),
  storageBucket: trimVal(rawEnv('VITE_FIREBASE_STORAGE_BUCKET')),
  messagingSenderId: trimVal(rawEnv('VITE_FIREBASE_MESSAGING_SENDER_ID')),
  appId: trimVal(rawEnv('VITE_FIREBASE_APP_ID')),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

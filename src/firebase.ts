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

interface EnvVarDiag {
  name: string;
  raw: string;
  trimmed: string;
  length: number;
  trimmedLength: number;
  hasNewline: boolean;
  hasTrailingWhitespace: boolean;
  charCodes: number[];
}

function inspectVar(name: string): EnvVarDiag {
  const raw = rawEnv(name);
  const trimmed = raw.trim();
  const codes = Array.from(raw).map(c => c.charCodeAt(0));
  return {
    name,
    raw,
    trimmed,
    length: raw.length,
    trimmedLength: trimmed.length,
    hasNewline: raw.includes('\n') || raw.includes('\r'),
    hasTrailingWhitespace: raw.length !== trimmed.length,
    charCodes: codes,
  };
}

const diag = {
  apiKey: inspectVar('VITE_FIREBASE_API_KEY'),
  authDomain: inspectVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: inspectVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: inspectVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: inspectVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: inspectVar('VITE_FIREBASE_APP_ID'),
};

// Always log auth domain diagnostics (root cause of %0A bug)
console.log('[Firebase AuthDomain RAW]', JSON.stringify(diag.authDomain));
console.log('[Firebase] authDomain length:', diag.authDomain.length, 'trimmedLength:', diag.authDomain.trimmedLength, 'hasNewline:', diag.authDomain.hasNewline, 'hasTrailing:', diag.authDomain.hasTrailingWhitespace, 'charCodes:', JSON.stringify(diag.authDomain.charCodes));

// Expose globally for in-page inspection
(window as any).__FIREBASE_DIAG = diag;

const firebaseConfig = {
  apiKey: diag.apiKey.trimmed,
  authDomain: diag.authDomain.trimmed,
  projectId: diag.projectId.trimmed,
  storageBucket: diag.storageBucket.trimmed,
  messagingSenderId: diag.messagingSenderId.trimmed,
  appId: diag.appId.trimmed,
};

console.log('[Firebase] Config:', JSON.stringify(firebaseConfig, null, 2));

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

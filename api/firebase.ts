import admin from 'firebase-admin';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  if (admin.apps.length) {
    initialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.trim()
    .replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    const msg = 'Firebase Admin SDK not configured: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY';
    throw new Error(msg);
  }

  const credential = admin.credential.cert({ projectId, clientEmail, privateKey });
  admin.initializeApp({ credential });

  initialized = true;
}

export function getDb() {
  ensureInit();
  return admin.firestore();
}

export function getAuth() {
  ensureInit();
  return admin.auth();
}

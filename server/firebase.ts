import admin from 'firebase-admin';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  if (admin.apps.length) {
    initialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin SDK not configured: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });

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

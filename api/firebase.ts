import admin from 'firebase-admin';
console.log('BOOT TRACE - api/firebase.ts module loaded');

let initialized = false;

function ensureInit() {
  if (initialized) return;
  if (admin.apps.length) {
    initialized = true;
    return;
  }

  console.log('BOOT 3 - firebase init start');

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.trim()
    .replace(/\\n/g, '\n');

  console.log('[FIREBASE_DIAG] projectId (JSON):', JSON.stringify(projectId));
  console.log('[FIREBASE_DIAG] clientEmail present:', !!clientEmail);
  console.log('[FIREBASE_DIAG] privateKey present:', !!privateKey);
  if (privateKey) {
    console.log('[FIREBASE_DIAG] privateKey length:', privateKey.length);
    console.log('[FIREBASE_DIAG] privateKey first 30 chars:', JSON.stringify(privateKey.slice(0, 30)));
  }

  if (!projectId || !clientEmail || !privateKey) {
    const msg = 'Firebase Admin SDK not configured: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY';
    console.error('[FIREBASE_DIAG]', msg);
    throw new Error(msg);
  }

  console.log('[FIREBASE_DIAG] calling admin.credential.cert()');

  try {
    const credential = admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    });
    console.log('[FIREBASE_DIAG] admin.credential.cert() OK');

    admin.initializeApp({ credential });
    console.log('[FIREBASE_DIAG] admin.initializeApp() OK');
  } catch (err: any) {
    console.error('[FIREBASE_DIAG] Firebase init FAILED');
    console.error('[FIREBASE_DIAG] error.message:', err.message);
    console.error('[FIREBASE_DIAG] error.stack:', err.stack);
    throw err;
  }

  initialized = true;
  console.log('BOOT 4 - firebase init complete');
}

export function getDb() {
  ensureInit();
  return admin.firestore();
}

export function getAuth() {
  ensureInit();
  return admin.auth();
}

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
  console.log('[FIREBASE_DIAG] FIREBASE_PROJECT_ID present:', !!process.env.FIREBASE_PROJECT_ID);
  console.log('[FIREBASE_DIAG] FIREBASE_CLIENT_EMAIL present:', !!process.env.FIREBASE_CLIENT_EMAIL);
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  console.log('[FIREBASE_DIAG] FIREBASE_PRIVATE_KEY present:', !!rawKey);
  if (rawKey) {
    console.log('[FIREBASE_DIAG] FIREBASE_PRIVATE_KEY length:', rawKey.length);
    console.log('[FIREBASE_DIAG] FIREBASE_PRIVATE_KEY first 30 chars:', JSON.stringify(rawKey.slice(0, 30)));
    console.log('[FIREBASE_DIAG] FIREBASE_PRIVATE_KEY contains \\n:', rawKey.includes('\\n'));
    console.log('[FIREBASE_DIAG] FIREBASE_PRIVATE_KEY contains actual newline:', rawKey.includes('\n'));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    const msg = 'Firebase Admin SDK not configured: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY';
    console.error('[FIREBASE_DIAG]', msg);
    throw new Error(msg);
  }

  const cleanedKey = privateKey.replace(/\\n/g, '\n');
  console.log('[FIREBASE_DIAG] cleanedKey first 30 chars:', JSON.stringify(cleanedKey.slice(0, 30)));
  console.log('[FIREBASE_DIAG] calling admin.credential.cert()');

  try {
    const credential = admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: cleanedKey,
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

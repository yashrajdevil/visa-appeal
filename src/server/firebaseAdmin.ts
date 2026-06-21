import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const firebaseConfig = require('../../firebase-applet-config.json');

// Initialize firebase admin
if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket
      });
      console.log("Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY");
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing. Using Application Default Credentials. This may fail with PERMISSION_DENIED or NOT_FOUND if the container's service account lacks access.");
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket
      });
    }
  } catch (err: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err.message);
    // fallback
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    });
  }
}

export const adminDb = getFirestore(undefined, firebaseConfig.firestoreDatabaseId || '(default)');
export const adminAuth = getAuth();
export const adminStorage = getStorage();

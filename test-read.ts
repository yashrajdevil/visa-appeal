import { adminDb } from './src/server/firebaseAdmin.ts';
async function testRead() {
  try {
    const snap = await adminDb.collection('users').limit(1).get();
    console.log("Read successful, docs:", snap.docs.length);
  } catch (error) {
    console.error("Read failed:", error);
  }
}
testRead();

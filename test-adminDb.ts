import { adminDb } from './src/server/firebaseAdmin.ts';

async function test() {
  try {
    const doc = await adminDb.collection('test').add({ msg: 'hello' });
    console.log("Success", doc.id);
  } catch (e: any) {
    console.error("Failed:", e.message);
  }
}

test();

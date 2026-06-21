import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'prefab-exchange-0tgzl',
  // maybe databaseId goes here? 
});
console.log('firebase admin app initialized...');

const db = getFirestore(app);
db.settings({ databaseId: 'ai-studio-4158a9d1-b501-4b68-b4bf-f6f878a979df' });

async function test() {
  try {
    const doc = await db.collection('test').add({ msg: 'hello' });
    console.log("Success", doc.id);
  } catch (e: any) {
    console.error("Failed:", e.message);
  }
}

test();

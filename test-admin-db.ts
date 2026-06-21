import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'prefab-exchange-0tgzl' });
const db = getFirestore(undefined, 'ai-studio-4158a9d1-b501-4b68-b4bf-f6f878a979df');

async function test() {
  const ref = db.collection('orders').doc('test');
  try {
    await ref.set({ ok: true });
    console.log("Written successfully!");
  } catch(e) {
    console.error("Write error:", e.message);
  }
}
test();

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
initializeApp({ projectId: 'demo-project' });
const db = getFirestore(undefined, 'ai-studio-4158a9d1-b501-4b68-b4bf-f6f878a979df');
console.log(db);

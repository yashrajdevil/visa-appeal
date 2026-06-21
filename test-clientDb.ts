import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const docRef = doc(db, 'test', 'node-client');
    await setDoc(docRef, { message: 'hello from node client SDK' });
    console.log("Success with node client SDK");
  } catch (e: any) {
    console.error("Failed client sdk:", e.message);
  }
}

test();

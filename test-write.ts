import { adminDb } from './src/server/firebaseAdmin.ts';

async function testWrite() {
  try {
    const orderRef = adminDb.collection('orders').doc('test_order_123');
    await orderRef.set({ id: 'test_order_123', status: 'created' });
    console.log("Write successful!");
  } catch (error) {
    console.error("Write failed:", error);
  }
}
testWrite();

import { Router, Request, Response } from 'express';
import { getDb } from '../firebase.js';
import { verifyWebhookSignature } from '../services/creem.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const headers = req.headers;

  const possibleHeaders = [
    'x-creem-signature',
    'creem-signature',
    'x-webhook-signature',
    'webhook-signature',
    'signature',
    'x-signature',
    'x-creem-webhook-signature',
    'creem-webhook-signature',
  ];

  let signature: string | undefined;
  for (const h of possibleHeaders) {
    const val = headers[h] as string | undefined;
    if (val) { signature = val; break; }
  }

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const secret = process.env.CREEM_WEBHOOK_SECRET || '';
  if (!secret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const isValid = await verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = req.body;
  const eventType = payload.eventType || payload.type || '';

  const metadata = payload?.object?.metadata || payload?.object?.customer?.metadata || {};
  const uid = metadata.uid || '';
  const caseId = metadata.caseId || metadata.request_id || payload?.object?.request_id || '';
  const plan = metadata.plan || '';

  if (!uid || !caseId || !plan) {
    return res.status(200).json({ received: true, warning: 'missing metadata' });
  }

  console.log(`UID RECEIVED (from webhook metadata): ${uid}`);
  const casePath = `users/${uid}/cases/${caseId}`;
  console.log(`UID USED FOR FIRESTORE: ${uid}`);
  console.log(`CASE PATH: ${casePath}`);
  const caseRef = getDb().collection('users').doc(uid).collection('cases').doc(caseId);
  const caseSnap = await caseRef.get();

  if (!caseSnap.exists) {
    return res.status(200).json({ received: true, warning: 'case not found' });
  }

  const isCompletedEvent =
    eventType === 'checkout.completed' ||
    eventType === 'checkout.session.completed' ||
    eventType === 'payment_intent.succeeded' ||
    eventType === 'charge.succeeded';

  const isRefundedEvent =
    eventType === 'charge.refunded' ||
    eventType === 'payment_intent.refunded';

  if (isCompletedEvent) {
    const updateData: Record<string, unknown> = {
      paymentStatus: 'completed',
      purchasedPlan: plan,
      updatedAt: new Date(),
    };
    if (payload.object?.id) updateData.checkoutId = payload.object.id;
    if (payload.object?.order?.id) updateData.orderId = payload.object.order.id;
    if (payload.object?.customer?.id) updateData.customerId = payload.object.customer.id;
    await caseRef.update(updateData);
  } else if (isRefundedEvent) {
    await caseRef.update({ paymentStatus: 'refunded', updatedAt: new Date() });
  }

  return res.status(200).json({ received: true });
});

export default router;

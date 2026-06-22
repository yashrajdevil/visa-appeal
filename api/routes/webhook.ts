import { Router, Request, Response } from 'express';
import { getDb } from '../firebase.js';
import { verifyWebhookSignature } from '../services/creem.js';
console.log('BOOT TRACE - api/routes/webhook.ts loaded');

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  console.log('CREEM WEBHOOK HIT');
  console.log('RAW BODY:', JSON.stringify(req.body, null, 2));
  console.log('HEADERS:', JSON.stringify(req.headers));

  const signature = req.headers['x-creem-signature'] as string;
  const rawBody = JSON.stringify(req.body);

  console.log('SIGNATURE value:', signature ? signature.slice(0, 20) + '...' : 'MISSING');
  console.log('SIGNATURE length:', signature?.length);

  if (!signature) {
    console.error('[Webhook] Missing signature');
    return res.status(401).json({ error: 'Missing signature' });
  }

  const isValid = await verifyWebhookSignature(rawBody, signature);
  console.log('SIGNATURE verification result:', isValid);

  if (!isValid) {
    console.error('[Webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  const eventType = event.type || '';
  console.log('EVENT type:', eventType);

  // Log ALL fields at the top level of the event
  console.log('EVENT top-level keys:', Object.keys(event));
  if (event.data) {
    console.log('EVENT.data keys:', Object.keys(event.data));
    console.log('EVENT.data full:', JSON.stringify(event.data));
  }

  // Try multiple metadata locations
  const metadata =
    event.data?.metadata ||
    event.metadata ||
    event.data?.object?.metadata ||
    {};

  console.log('METADATA resolved:', JSON.stringify(metadata));
  console.log('METADATA uid:', metadata.uid);
  console.log('METADATA caseId:', metadata.caseId);
  console.log('METADATA plan:', metadata.plan);

  if (!metadata.uid || !metadata.caseId || !metadata.plan) {
    // Maybe metadata is nested differently — check request_id too
    const requestId = event.data?.request_id || event.request_id || event.data?.object?.request_id;
    console.log('REQUEST_ID from event:', requestId);
    console.error('[Webhook] Missing metadata', metadata);
    return res.status(200).json({ received: true, warning: 'missing metadata' });
  }

  const { uid, caseId, plan } = metadata;
  console.log('LOOKING UP case:', { uid, caseId });

  const caseRef = getDb().collection('users').doc(uid).collection('cases').doc(caseId);
  const caseSnap = await caseRef.get();

  if (!caseSnap.exists) {
    console.error('[Webhook] Case not found', { uid, caseId });
    return res.status(200).json({ received: true, warning: 'case not found' });
  }

  console.log('CASE found, current paymentStatus:', caseSnap.data()?.paymentStatus);

  const isCompletedEvent =
    eventType === 'checkout.session.completed' ||
    eventType === 'payment_intent.succeeded' ||
    eventType === 'charge.succeeded';

  const isRefundedEvent =
    eventType === 'charge.refunded' ||
    eventType === 'payment_intent.refunded';

  if (isCompletedEvent) {
    console.log('UPDATING case paymentStatus -> completed');
    await caseRef.update({
      paymentStatus: 'completed',
      purchasedPlan: plan,
      updatedAt: new Date(),
    });
    console.log('[Webhook] Payment completed for', { uid, caseId, plan });
  } else if (isRefundedEvent) {
    console.log('UPDATING case paymentStatus -> refunded');
    await caseRef.update({
      paymentStatus: 'refunded',
      updatedAt: new Date(),
    });
    console.log('[Webhook] Payment refunded', { uid, caseId });
  } else {
    console.log('[Webhook] Unhandled event type', eventType);
  }

  return res.status(200).json({ received: true });
});

export default router;

import { Router, Request, Response } from 'express';
import { getDb } from '../firebase.js';
import { verifyWebhookSignature } from '../services/creem.js';
console.log('BOOT TRACE - api/routes/webhook.ts loaded');

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  console.log('CREEM WEBHOOK HIT');

  // 1. Log EVERYTHING
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const headers = req.headers;
  console.log('ALL HEADERS:', JSON.stringify(headers));
  console.log('RAW BODY:', rawBody);
  console.log('RAW BODY length:', rawBody.length);

  // 2. Find signature — try every possible header name
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
  let foundHeader: string | undefined;

  for (const h of possibleHeaders) {
    const val = headers[h] as string | undefined;
    if (val) {
      signature = val;
      foundHeader = h;
      console.log(`FOUND signature in header "${h}":`, val.slice(0, 30) + '...');
      break;
    }
  }

  if (!signature) {
    console.error('[Webhook] No signature found in any known header');
    console.error('[Webhook] Available headers:', Object.keys(headers));
    return res.status(401).json({
      error: 'Missing signature',
      availableHeaders: Object.keys(headers),
      checkedHeaders: possibleHeaders,
    });
  }

  console.log('SIGNATURE header used:', foundHeader);
  console.log('SIGNATURE value (full):', signature);
  console.log('SIGNATURE length:', signature.length);

  // 3. Check secret
  const secret = process.env.CREEM_WEBHOOK_SECRET || '';
  console.log('WEBHOOK_SECRET length:', secret.length);
  console.log('WEBHOOK_SECRET prefix:', secret.slice(0, 10));
  console.log('WEBHOOK_SECRET suffix:', secret.slice(-5));
  console.log('WEBHOOK_SECRET contains newline:', secret.includes('\n'));
  console.log('WEBHOOK_SECRET contains space:', secret.includes(' '));
  console.log('WEBHOOK_SECRET trimmed equals raw:', secret === secret.trim());

  if (!secret) {
    console.error('[Webhook] CREEM_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // 4. Try verification
  const isValid = await verifyWebhookSignature(rawBody, signature);
  console.log('SIGNATURE verification result:', isValid);

  if (!isValid) {
    // Log diagnostic info about signature format
    console.log('SIGNATURE char codes (first 20):', signature.slice(0, 20).split('').map(c => c.charCodeAt(0)));
    console.log('SIGNATURE is hex?', /^[0-9a-fA-F]+$/.test(signature));
    console.log('SIGNATURE is base64?', /^[A-Za-z0-9+/=]+$/.test(signature.replace(/-/g, '+').replace(/_/g, '/')));

    return res.status(401).json({
      error: 'Invalid signature',
      headerUsed: foundHeader,
      signaturePrefix: signature.slice(0, 20),
      signatureLength: signature.length,
      secretLength: secret.length,
      rawBodyLength: rawBody.length,
      isHex: /^[0-9a-fA-F]+$/.test(signature),
    });
  }

  // 5. Process event — actual Creem structure: { eventType, object: { metadata, customer: { metadata }, request_id } }
  const payload = req.body;
  const eventType = payload.eventType || payload.type || '';
  console.log('EVENT type:', eventType);
  console.log('EVENT top-level keys:', Object.keys(payload));

  // Log object and customer metadata explicitly
  console.log('METADATA source object.metadata:', JSON.stringify(payload?.object?.metadata));
  console.log('METADATA source customer.metadata:', JSON.stringify(payload?.object?.customer?.metadata));
  console.log('REQUEST_ID from object:', payload?.object?.request_id);

  // Extract metadata: Creem puts it in object.metadata
  const metadata = payload?.object?.metadata || payload?.object?.customer?.metadata || {};
  const uid = metadata.uid || '';
  const caseId = metadata.caseId || metadata.request_id || payload?.object?.request_id || '';
  const plan = metadata.plan || '';

  console.log('FINAL uid:', uid);
  console.log('FINAL caseId:', caseId);
  console.log('FINAL plan:', plan);

  if (!uid || !caseId || !plan) {
    console.error('[Webhook] Missing metadata', { uid, caseId, plan });
    return res.status(200).json({ received: true, warning: 'missing metadata' });
  }

  console.log('LOOKING UP case:', { uid, caseId });

  const caseRef = getDb().collection('users').doc(uid).collection('cases').doc(caseId);
  const caseSnap = await caseRef.get();

  if (!caseSnap.exists) {
    console.error('[Webhook] Case not found', { uid, caseId });
    return res.status(200).json({ received: true, warning: 'case not found' });
  }

  console.log('CASE found, current paymentStatus:', caseSnap.data()?.paymentStatus);

  const isCompletedEvent =
    eventType === 'checkout.completed' ||
    eventType === 'checkout.session.completed' ||
    eventType === 'payment_intent.succeeded' ||
    eventType === 'charge.succeeded';

  const isRefundedEvent =
    eventType === 'charge.refunded' ||
    eventType === 'payment_intent.refunded';

  if (isCompletedEvent) {
    console.log('UPDATING case paymentStatus -> completed');
    const updateData: Record<string, unknown> = {
      paymentStatus: 'completed',
      purchasedPlan: plan,
      updatedAt: new Date(),
    };
    // Save checkout details if present
    if (payload.object?.id) updateData.checkoutId = payload.object.id;
    if (payload.object?.order?.id) updateData.orderId = payload.object.order.id;
    if (payload.object?.customer?.id) updateData.customerId = payload.object.customer.id;
    await caseRef.update(updateData);
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

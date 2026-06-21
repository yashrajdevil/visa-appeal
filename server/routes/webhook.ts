import { Router, Request, Response } from 'express';
import { getDb } from '../firebase';
import { verifyWebhookSignature } from '../services/creem';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-creem-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!signature) {
      console.error('[Webhook] Missing signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const isValid = await verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('[Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.type || '';
    const metadata = event.data?.metadata || {};

    if (!metadata.uid || !metadata.caseId || !metadata.plan) {
      console.error('[Webhook] Missing metadata', metadata);
      return res.status(200).json({ received: true });
    }

    const { uid, caseId, plan } = metadata;

    const caseRef = getDb().collection('users').doc(uid).collection('cases').doc(caseId);
    const caseSnap = await caseRef.get();

    if (!caseSnap.exists) {
      console.error('[Webhook] Case not found', { uid, caseId });
      return res.status(200).json({ received: true });
    }

    const isCompletedEvent =
      eventType === 'checkout.session.completed' ||
      eventType === 'payment_intent.succeeded' ||
      eventType === 'charge.succeeded';

    const isRefundedEvent =
      eventType === 'charge.refunded' ||
      eventType === 'payment_intent.refunded';

    if (isCompletedEvent) {
      await caseRef.update({
        paymentStatus: 'completed',
        purchasedPlan: plan,
        updatedAt: new Date(),
      });
      console.log('[Webhook] Payment completed', { uid, caseId, plan });
    } else if (isRefundedEvent) {
      await caseRef.update({
        paymentStatus: 'refunded',
        updatedAt: new Date(),
      });
      console.log('[Webhook] Payment refunded', { uid, caseId });
    } else {
      console.log('[Webhook] Unhandled event type', eventType);
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Webhook] Error', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

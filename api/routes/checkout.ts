import { Router, Response } from 'express';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth.js';
import { getDb } from '../firebase.js';
import { createCheckoutSession } from '../services/creem.js';
console.log('BOOT TRACE - api/routes/checkout.ts loaded');

const router = Router();

const VALID_PLANS = ['starter', 'standard', 'premium'] as const;

router.post('/', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const { caseId, plan } = req.body;

    if (!caseId) {
      return res.status(400).json({ error: 'caseId is required' });
    }
    if (!plan || !VALID_PLANS.includes(plan)) {
      return res.status(400).json({ error: 'Plan must be starter, standard, or premium' });
    }

    const caseRef = getDb().collection('users').doc(uid).collection('cases').doc(caseId);
    const caseSnap = await caseRef.get();

    if (!caseSnap.exists) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = caseSnap.data()!;

    if (caseData.paymentStatus === 'completed') {
      return res.status(400).json({ error: 'Already purchased' });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const successUrl = `${appUrl}/results/${caseId}?purchase=success`;
    const cancelUrl = `${appUrl}/results/${caseId}`;

    const session = await createCheckoutSession({
      plan,
      uid,
      caseId,
      successUrl,
      cancelUrl,
    });

    await caseRef.update({
      paymentStatus: 'pending',
      purchasedPlan: plan,
      updatedAt: new Date(),
    });

    return res.json({ checkoutUrl: session.checkout_url });
  } catch (err: any) {
    console.error('[Checkout]', err);
    return res.status(500).json({ error: err.message || 'Checkout creation failed' });
  }
});

export default router;

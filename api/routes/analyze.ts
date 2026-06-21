import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth';
import { getDb } from '../firebase';
import { generateAnalysis } from '../services/gemini';

const router = Router();

router.post('/', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const { country, visaType, purpose, travelHistory, refusalReasons, questionnaireResponses } = req.body;

    if (!country || !visaType) {
      return res.status(400).json({ error: 'Country and visa type are required' });
    }

    const caseId = uuidv4();

    const analysisData = await generateAnalysis({
      country,
      visaType,
      purpose: purpose || '',
      travelHistory: travelHistory || '',
      refusalReasons: refusalReasons || [],
      questionnaireResponses: questionnaireResponses || [],
    });

    const caseDoc = {
      caseId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      country,
      visaType,
      analysisData,
      paymentStatus: 'none',
      purchasedPlan: '',
      pdfUrls: { starter: '', standard: '', premium: '' },
    };

    await getDb().collection('users').doc(uid).collection('cases').doc(caseId).set(caseDoc);

    return res.json({ caseId });
  } catch (err: any) {
    console.error('[Analyze]', err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

export default router;

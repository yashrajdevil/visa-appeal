import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth.js';
import { getDb } from '../firebase.js';
import { generateAnalysis, generateAppealLetter } from '../services/gemini.js';

const router = Router();

router.post('/', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const { country, visaType, purpose, travelHistory, refusalReasons, questionnaireResponses, refusalDocument } = req.body;

    if (!country || !visaType) {
      return res.status(400).json({ error: 'Country and visa type are required' });
    }

    console.log(`UID RECEIVED: ${uid}`);

    const caseId = uuidv4();

    const analysisData = await generateAnalysis({
      country,
      visaType,
      purpose: purpose || '',
      travelHistory: travelHistory || '',
      refusalReasons: refusalReasons || [],
      questionnaireResponses: questionnaireResponses || [],
      refusalDocument: refusalDocument || undefined,
    });

    const appealLetter = await generateAppealLetter(analysisData, {
      country,
      visaType,
      purpose: purpose || '',
      travelHistory: travelHistory || '',
      refusalReasons: refusalReasons || [],
      questionnaireResponses: questionnaireResponses || [],
      refusalDocument: refusalDocument || undefined,
    });

    analysisData.appeal_letter = appealLetter;

    const casePath = `users/${uid}/cases/${caseId}`;
    console.log(`UID USED FOR FIRESTORE: ${uid}`);
    console.log(`CASE PATH: ${casePath}`);
    const existingSnap = await getDb().collection('users').doc(uid).collection('cases').doc(caseId).get();
    console.log(`CASE FOUND: ${existingSnap.exists}`);

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

    console.log('SAVED ANALYSIS DATA:', JSON.stringify(analysisData, null, 2));

    await getDb().collection('users').doc(uid).collection('cases').doc(caseId).set(caseDoc);
    console.log(`CASE WRITE SUCCESS: ${casePath}`);

    return res.json({ caseId });
  } catch (err: any) {
    console.error(`CASE WRITE FAILED:`, err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

export default router;

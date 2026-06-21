import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../firebase.js';
console.log('BOOT TRACE - api/middleware/auth.ts loaded');

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  console.log('AUTH HEADER PRESENT:', !!req.headers.authorization);

  const token = req.headers.authorization?.replace('Bearer ', '');

  console.log('TOKEN LENGTH:', token?.length);

  try {
    const decoded = await getAuth().verifyIdToken(token);

    console.log('VERIFY SUCCESS');
    console.log({
      uid: decoded.uid,
      aud: decoded.aud,
      iss: decoded.iss,
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    req.uid = decoded.uid;
    next();
  } catch (error: any) {
    console.error('VERIFY FAILED');
    console.error('CODE:', error?.code);
    console.error('MESSAGE:', error?.message);
    console.error(error);

    return res.status(401).json({
      error: 'Invalid token',
      code: error?.code,
      message: error?.message,
    });
  }
}

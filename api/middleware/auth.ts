import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../firebase.js';
console.log('BOOT TRACE - api/middleware/auth.ts loaded');

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.split('Bearer ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);

    console.log('TOKEN VERIFIED');
    console.log({
      uid: decoded.uid,
      aud: decoded.aud,
      iss: decoded.iss,
    });

    req.uid = decoded.uid;
    next();
  } catch (error: any) {
    console.error('FIREBASE AUTH ERROR');
    console.error(error);
    console.error('ERROR CODE:', error?.code);
    console.error('ERROR MESSAGE:', error?.message);

    return res.status(401).json({
      error: 'Invalid token',
      code: error?.code,
      message: error?.message,
    });
  }
}

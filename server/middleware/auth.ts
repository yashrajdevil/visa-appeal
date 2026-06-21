import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../firebase';

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
    req.uid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

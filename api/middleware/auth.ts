import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../firebase.js';

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function verifyAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!decoded.email || !decoded.role || !['superadmin', 'admin'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const age = Date.now() - decoded.iat;
    if (age > 86400000) return res.status(401).json({ error: 'Token expired' });
    (req as any).admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../firebase.js';

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const decoded = await getAuth().verifyIdToken(token);
    console.log('=== verifyAuth decoded token ===');
    console.log('decodedToken.uid:', decoded.uid);
    console.log('decodedToken.email:', decoded.email);
    console.log('decodedToken.firebase.identities:', JSON.stringify((decoded as any).firebase?.identities));
    console.log('decodedToken.firebase.sign_in_provider:', (decoded as any).firebase?.sign_in_provider);
    console.log('decodedToken.role:', (decoded as any).role);
    console.log('req.uid (before assignment):', req.uid);
    req.uid = decoded.uid;
    console.log('req.uid (after assignment):', req.uid);
    console.log('=== end verifyAuth ===');
    next();
  } catch (error: any) {
    console.error('verifyAuth FAILED:', error.message);
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

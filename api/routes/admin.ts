import { Router, Request, Response } from 'express';
import express from 'express';
import { getDb, getAuth } from '../firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const router = Router();

// Belt-and-suspenders: apply JSON body parser directly to this router
// to ensure body is parsed even if app-level express.json() fails
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function getAdminEmails(): { email: string; password: string }[] {
  const primaryEmail = process.env.ADMIN_EMAIL?.trim();
  const primaryPassword = process.env.ADMIN_PASSWORD?.trim();
  const additional = process.env.ADMIN_EMAILS?.split(',').map(s => s.trim()).filter(Boolean) || [];

  const admins: { email: string; password: string }[] = [];
  if (primaryEmail && primaryPassword) {
    admins.push({ email: primaryEmail.toLowerCase(), password: primaryPassword });
  }
  for (const entry of additional) {
    const [e, p] = entry.split(':');
    if (e && p) admins.push({ email: e.toLowerCase().trim(), password: p.trim() });
  }
  return admins;
}

router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!decoded.email || !decoded.role) return res.status(401).json({ error: 'Invalid token' });
    const age = Date.now() - decoded.iat;
    if (age > 86400000) return res.status(401).json({ error: 'Token expired' });
    return res.json({ email: decoded.email, role: decoded.role, valid: true });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  console.log('ADMIN LOGIN HIT');
  console.log('METHOD:', req.method);
  console.log('HEADERS:', req.headers);
  console.log('CONTENT TYPE:', req.headers['content-type']);
  console.log('REQ BODY:', req.body);
  try {
    const body = req.body || {};
    const { email, password } = body;

    if (!email || !password) {
      console.error('[Admin Login] Missing credentials');
      return res.status(400).json({
        success: false,
        bodyReceived: req.body,
        contentType: req.headers['content-type'],
        error: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admins = getAdminEmails();
    const match = admins.find(a => a.email === normalizedEmail);

    if (!match || match.password !== password) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const role = normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase().trim() ? 'superadmin' : 'admin';

    try {
      const auth = getAuth();
      const token = await auth.createCustomToken(normalizedEmail, { role, provider: 'env' });
      return res.json({ token, email: normalizedEmail, role });
    } catch (fbErr: any) {
      console.error('[Admin] Firebase custom token failed, falling back to session token:', fbErr.message);
      const sessionToken = Buffer.from(JSON.stringify({ email: normalizedEmail, role, iat: Date.now() })).toString('base64');
      return res.json({ token: sessionToken, email: normalizedEmail, role, sessionOnly: true });
    }
  } catch (err: any) {
    console.error('[Admin Login Error]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const doc = await db.collection('admin').doc('settings').get();
    const defaults = {
      pricing: { starter: 29, standard: 59, premium: 99, currency: 'USD' },
      cta: { headline: 'Build Your Visa Appeal', subtitle: 'AI-powered analysis in minutes', buttonText: 'Start Your Appeal' },
      seo: { siteTitle: 'Visa Appeal Builder', metaDescription: '', ogImage: '' },
      features: { enableBlog: true, enableGuides: true, enableSampleReport: true },
      branding: { siteName: 'Visa Appeal Builder', logoUrl: '', faviconUrl: '' },
    };
    if (!doc.exists) {
      await db.collection('admin').doc('settings').set(defaults);
      return res.json(defaults);
    }
    const data = doc.data();
    return res.json({ ...defaults, ...data });
  } catch (err: any) {
    console.error('[Admin Settings GET Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const allowed = ['pricing', 'cta', 'seo', 'features', 'branding'];
    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid settings fields provided' });
    }
    update.updatedAt = Timestamp.now();
    update.updatedBy = req.body.updatedBy || 'admin';
    await db.collection('admin').doc('settings').set(update, { merge: true });
    const updated = await db.collection('admin').doc('settings').get();
    return res.json(updated.data());
  } catch (err: any) {
    console.error('[Admin Settings PUT Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('admin').doc('users').collection('list').orderBy('createdAt', 'desc').get();
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(users);
  } catch (err: any) {
    console.error('[Admin Users GET Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const { email, role } = body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    const validRoles = ['admin', 'editor', 'author'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    const db = getDb();
    const docRef = db.collection('admin').doc('users').collection('list').doc();
    await docRef.set({
      email: email.toLowerCase().trim(),
      role,
      createdAt: Timestamp.now(),
      createdBy: body.createdBy || 'admin',
      status: 'active',
    });
    const created = await docRef.get();
    return res.json({ id: created.id, ...created.data() });
  } catch (err: any) {
    console.error('[Admin Users POST Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body || {};
    const { role, status } = body;
    const db = getDb();
    const update: Record<string, any> = { updatedAt: Timestamp.now() };
    if (role) update.role = role;
    if (status) update.status = status;
    await db.collection('admin').doc('users').collection('list').doc(id).update(update);
    const updated = await db.collection('admin').doc('users').collection('list').doc(id).get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (err: any) {
    console.error('[Admin Users PATCH Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const db = getDb();
    await db.collection('admin').doc('users').collection('list').doc(id).delete();
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Users DELETE Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

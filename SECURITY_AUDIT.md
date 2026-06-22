# Security Audit — Visa Appeal Builder

**Date:** 2026-06-23
**Scope:** Full-stack security review (Firebase, Express API, React SPA, Vercel deployment)

---

## Critical Issues

### C-1: No Firestore Security Rules

**File:** `firestore.rules` — file does not exist.

**Impact:** Firestore is wide open. Any authenticated client can read, write, update, or delete any document in any collection via the Firebase client SDK. A user can trivially read another user's cases by iterating the `users/{uid}/cases` path. A user can also modify their own `paymentStatus` client-side.

**Evidence:** The client imports `getFirestore` in `src/firebase.ts` and uses `db` throughout the frontend. Without Firestore rules, all operations are permitted.

**Fix:** Create `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own cases
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Admin settings — only admin SDK access (deny client)
    match /admin/{document=**} {
      allow read, write: if false;
    }
    // Blog articles — public read
    match /articles/{article} {
      allow read: if true;
      allow write: if false;
    }
    match /categories/{category} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

### C-2: No Storage Security Rules

**File:** `storage.rules` — file does not exist.

**Impact:** Firebase Storage is wide open. Anyone can upload, download, or delete any file.

**Fix:** Create `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Admin media uploads — require admin auth via custom claims
    match /media/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role in ['superadmin', 'admin'];
    }
  }
}
```

---

### C-3: Production Debug Endpoints Expose Secrets

**Files:**
- `api/app.ts:272` — `GET /api/debug-gemini` — returns `keyPrefix`, `keySuffix`, `keyLength`
- `api/app.ts:280` — `POST /api/test-gemini` — proxies Gemini API calls, logs full request/response
- `api/app.ts:342` — `GET /api/debug-gemini-project` — returns `key.prefix`, `key.suffix`, proxies model list + generate
- `api/app.ts:417` — `GET /api/test-generate-minimal` — full proxy to Gemini
- `api/app.ts:470` — `GET /api/test-gemini-direct` — full proxy to Gemini
- `api/app.ts:490` — `GET /api/debug-model` — returns model diagnostic info

**Impact:** These endpoints are accessible in production on Vercel. They leak the Gemini API key prefix/suffix (12 of ~39 chars = ~30% of the key), proxy arbitrary Gemini API calls through the server, and expose internal model configuration. An attacker can use these endpoints to probe the Gemini API without exposing their own IP, or to reconstruct the full key via brute force of the remaining ~27 chars.

**Fix:** Remove all debug endpoints for production:
```typescript
// Remove these routes entirely from app.ts
app.get('/api/debug-gemini', ...)        // line 272
app.post('/api/test-gemini', ...)        // line 280
app.get('/api/debug-gemini-project', ...) // line 342
app.get('/api/test-generate-minimal', ...) // line 417
app.get('/api/test-gemini-direct', ...)   // line 470
app.get('/api/debug-model', ...)          // line 490
```

Or gate them behind `process.env.VERCEL_ENV !== 'production'`.

---

## High Issues

### H-1: Admin API Routes Have No Authentication Middleware

**Files:** `api/routes/admin.ts`

**Endpoints without auth:**
- `GET /api/admin/settings` — anyone can read admin settings (pricing, CTA, SEO defaults)
- `PUT /api/admin/settings` — anyone can modify admin settings
- `GET /api/admin/users` — anyone can list admin users
- `POST /api/admin/users` — anyone can create admin users
- `PATCH /api/admin/users/:id` — anyone can update admin users
- `DELETE /api/admin/users/:id` — anyone can delete admin users

**Impact:** These endpoints have zero authentication. An attacker who discovers the API base URL can read and modify all admin settings and user accounts.

**Fix:** Add a `verifyAdmin` middleware to all admin routes:
```typescript
async function verifyAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!decoded.role || !['superadmin', 'admin'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (Date.now() - decoded.iat > 86400000) {
      return res.status(401).json({ error: 'Token expired' });
    }
    (req as any).admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

### H-2: No Rate Limiting on Expensive Endpoints

**Files:**
- `api/routes/analyze.ts:10` — `POST /api/analyze` calls Gemini AI (cost per request)
- `api/routes/admin.ts:28` — `POST /api/admin/login` (brute-force vector)
- `api/services/gemini.ts` — all model fallback attempts

**Impact:** An attacker can drive up AI costs by flooding `/api/analyze`. Admin login endpoint is unprotected against brute-force attacks.

**Fix:** Add `express-rate-limit`:
```typescript
import rateLimit from 'express-rate-limit';

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 5,                 // 5 requests per minute per IP
  message: { error: 'Too many requests, please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts per 15 minutes
  message: { error: 'Too many login attempts.' },
});

app.use('/api/analyze', analyzeLimiter);
app.use('/api/admin/login', loginLimiter);
```

---

### H-3: Auth Middleware Logs Sensitive Data in Production

**File:** `api/middleware/auth.ts:10-33`

**Code:**
```typescript
console.log('TOKEN LENGTH:', token?.length);
console.log({ uid: decoded.uid, aud: decoded.aud, iss: decoded.iss, projectId: ... });
console.error('CODE:', error?.code);
console.error('MESSAGE:', error?.message);
```

**Impact:** Firebase ID tokens contain user UIDs and project info. Error messages may contain stack traces or internal details. In Vercel production, these logs are visible in the Vercel dashboard and retained.

**Fix:**
```typescript
if (process.env.VERCEL_ENV !== 'production') {
  console.log('AUTH HEADER PRESENT:', !!req.headers.authorization);
}
```

---

### H-4: Input Validation Gaps on Admin Endpoints

**File:** `api/routes/admin.ts`

**Issues:**
- `PUT /admin/settings` — no schema validation; any field can be written to the Firestore document
- `POST /admin/users` — no email format validation; no password strength check (though users don't get passwords here)
- `PATCH /admin/users/:id` — no validation on role/status values beyond a basic check

**Fix:** Add input validation using a lightweight validator or manual checks:
```typescript
const validRoles = ['admin', 'editor', 'author'];
const validStatuses = ['active', 'disabled'];
const allowedSettingsKeys = ['pricing', 'cta', 'seo', 'features', 'branding'];
```

---

### H-5: Admin Login Uses Plain-Text Password Comparison

**File:** `api/routes/admin.ts:59`

**Code:** `match.password !== password`

**Impact:** Admin passwords from env vars are compared directly as plain text. No hashing. If the env var is accidentally logged or exposed, passwords are compromised.

**Fix:** Store a bcrypt hash in the env var instead:
```typescript
import bcrypt from 'bcrypt';
const match = await bcrypt.compare(password, hashedPassword);
```

Note: This requires storing `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD`. Not introducing dependencies — if the env var format stays as-is, consider this a medium-severity design note.

---

## Medium Issues

### M-1: No Helmet / Security Headers on API Responses

**Files:** `api/app.ts` (no helmet middleware)

**Impact:** The Express API does not set `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, or `Content-Security-Policy` headers. Vercel's `vercel.json` sets some headers for the frontend, but API routes served from `api/index.ts` lack these protections.

**Fix:**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### M-2: Sensitive Data in Server Logs (Boot Sequence)

**Files:**
- `api/index.ts:8-17` — logs `GEMINI_API_KEY` prefix, suffix, length at boot
- `api/firebase.ts:35-40` — logs `FIREBASE_PRIVATE_KEY` length and first 30 chars at boot
- `api/routes/webhook.ts:5-8` — logs `CREEM_WEBHOOK_SECRET` length, prefix, suffix at every webhook hit

**Impact:** On Vercel, these logs persist in the deployment logs. Anyone with Vercel dashboard access can see partial API keys and private key metadata.

**Fix:** Remove or gate all sensitive logging:
```typescript
if (process.env.VERCEL_ENV !== 'production') {
  console.log('ENV GEMINI_API_KEY prefix:', geminiKey?.slice(0, 15));
}
```

---

### M-3: CORS Origin Is Client-Configurable

**File:** `api/app.ts:14-17`

**Code:**
```typescript
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));
```

**Impact:** In local development, `APP_URL` is `http://localhost:5173`. If an attacker sets up a phishing page that mimics the app and tricks a developer into visiting it with the local server running, CORS with credentials could allow cookie/session theft.

**Fix:** Restrict CORS to known origins:
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://visa-appeal.vercel.app',
  process.env.APP_URL,        // custom domain
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

---

### M-4: Health Endpoint Exposes System Checks

**File:** `api/app.ts:66` — `GET /api/health`

**Issue:** Returns the results of all system checks including database connectivity, Gemini API status, etc. This information is useful for attackers to probe the infrastructure.

**Fix:** In production, return a minimal status:
```typescript
if (process.env.VERCEL_ENV === 'production') {
  return res.json({ status: allPassed ? 'ok' : 'degraded' });
}
```

---

### M-5: Local `.env` File Exists with Production Secrets

**File:** `.env` (not git-tracked, but present on disk)

**Issue:** The `.env` file contains valid-looking production secrets:
- `FIREBASE_PRIVATE_KEY` — Firebase Admin private key (full RSA key)
- `GEMINI_API_KEY` — valid Gemini API key
- `CREEM_API_KEY` — Creem payment API key (test mode)
- `CREEM_WEBHOOK_SECRET` — webhook secret (test mode)

While `.gitignore` prevents commit, the file exists on disk. Any local compromise (malicious npm package, VS Code extension, backup) exposes all production secrets.

**Fix:**
1. Rotate all keys immediately (these are test keys but practice matters)
2. Use `doppler` / `1Password CLI` / `Vercel env pull` instead of a local `.env` file
3. Add `.env` to `.gitattributes` with `*.env linguist-generated` as a secondary safeguard

---

### M-6: No CSRF Protection on Payment Webhook

**File:** `api/routes/webhook.ts`

**Issue:** The webhook signature verification is the only guard. If the signature verification has a bug (as the existing code indicates — it extensively logs failed verifications), an attacker could simulate payment completion events.

**Fix:** Ensure the `verifyWebhookSignature` function uses a constant-time comparison (`crypto.timingSafeEqual`).

---

## Summary Table

| ID | Issue | Severity | File(s) |
|---|---|---|---|
| C-1 | No Firestore security rules | Critical | — |
| C-2 | No Storage security rules | Critical | — |
| C-3 | Production debug endpoints expose secrets | Critical | `api/app.ts` |
| H-1 | Admin API routes lack auth middleware | High | `api/routes/admin.ts` |
| H-2 | No rate limiting on expensive/AI endpoints | High | `api/routes/analyze.ts` |
| H-3 | Auth middleware logs sensitive data | High | `api/middleware/auth.ts` |
| H-4 | Input validation gaps on admin endpoints | High | `api/routes/admin.ts` |
| H-5 | Plain-text password comparison | High | `api/routes/admin.ts` |
| M-1 | No Helmet security headers on API | Medium | `api/app.ts` |
| M-2 | Sensitive data in server boot logs | Medium | `api/index.ts`, `api/firebase.ts` |
| M-3 | CORS origin is client-configurable | Medium | `api/app.ts` |
| M-4 | Health endpoint exposes system details | Medium | `api/app.ts` |
| M-5 | Local `.env` file with production secrets | Medium | `.env` |
| M-6 | No CSRF on payment webhook | Medium | `api/routes/webhook.ts` |

---

## Quick Wins (5-minute fixes)

1. **Remove debug endpoints** — delete or gate 6 route handlers in `api/app.ts`
2. **Add Firestore rules** — create `firestore.rules` with user isolation
3. **Add Storage rules** — create `storage.rules` blocking public write
4. **Gate sensitive logs** — wrap boot logs in `VERCEL_ENV !== 'production'` checks
5. **Restrict CORS origins** — hard-code allowed origins in `api/app.ts`

## Recommended Immediate Actions

1. Rotate all secrets in `.env` (even test keys) since they've been exposed on disk
2. Deploy `firestore.rules` and `storage.rules` via Firebase CLI
3. Deploy a hotfix removing all debug endpoints
4. Add rate limiting to `/api/analyze` before next deployment
5. Add `helmet` middleware to Express app

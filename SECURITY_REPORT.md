# Production Security Report — Lumera

**Date:** 2026-06-23
**Status:** Post-hardening pass

---

## 1. Fixed Issues

### 1.1 Debug Endpoints Removed

All 6 production-debug endpoints deleted from `api/app.ts`:

| Endpoint | Risk | Action |
|---|---|---|
| `GET /api/debug-gemini` | Leaked key prefix/suffix, key length, env name | Removed |
| `POST /api/test-gemini` | Proxied Gemini calls through server, logged full key | Removed |
| `GET /api/debug-gemini-project` | Leaked key prefix/suffix, proxied model list | Removed |
| `GET /api/test-generate-minimal` | Proxied Gemini calls through server | Removed |
| `GET /api/test-gemini-direct` | Proxied Gemini calls through server | Removed |
| `GET /api/debug-model` | Exposed model diagnostic info | Removed |

`GET /api/webhooks/creem` (GET test endpoint) also removed.

---

### 1.2 Secret Leakage in Boot Logs Removed

| File | Before | After |
|---|---|---|
| `api/index.ts` | Logged `GEMINI_API_KEY` prefix/suffix/length, listed all API env vars with value prefixes | Minimal export only |
| `api/firebase.ts` | Logged `FIREBASE_PRIVATE_KEY` length and first 30 chars | No diagnostic logging |
| `api/routes/webhook.ts` | Logged `CREEM_WEBHOOK_SECRET` prefix/suffix/length/char codes | Minimal diagnostic info |

---

### 1.3 Admin Routes Locked Down

All admin routes now require `verifyAdmin` middleware:

| Route | Method | Before | After |
|---|---|---|---|
| `/api/admin/settings` | GET | No auth | `verifyAdmin` |
| `/api/admin/settings` | PUT | No auth | `verifyAdmin` |
| `/api/admin/users` | GET | No auth | `verifyAdmin` |
| `/api/admin/users` | POST | No auth | `verifyAdmin` |
| `/api/admin/users/:id` | PATCH | No auth | `verifyAdmin` |
| `/api/admin/users/:id` | DELETE | No auth | `verifyAdmin` |

`POST /api/admin/login` and `GET /api/admin/verify` remain unauthenticated by design (login must be open, verify validates existing token).

---

### 1.4 Rate Limiting Added

| Scope | Limit | Endpoints |
|---|---|---|
| Public (global) | 100 req / 15 min / IP | All routes |
| AI endpoints | 10 req / 1 min / IP | `/api/analyze` |
| Admin | 20 req / 1 min / IP | `/api/admin/*` |
| Login | 10 req / 15 min / IP | `/api/admin/login` |

All rate limiters return standard `RateLimit-*` headers and `429 Too Many Requests` on abuse.

---

### 1.5 Security Headers Added (Helmet)

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` |
| `X-DNS-Prefetch-Control` | `off` |
| `X-Download-Options` | `noopen` |
| `X-Permitted-Cross-Domain-Policies` | `none` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

`Content-Security-Policy` is intentionally not set by Helmet to avoid breaking the app's inline styles and scripts. Vercel's platform headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) from `vercel.json` remain in place as a secondary layer.

---

### 1.6 Auth Middleware Logging Reduced

`api/middleware/auth.ts` no longer logs:
- Token length
- Decoded UID/aud/iss
- Error codes and messages

Returns generic `401 Invalid token` without details.

---

### 1.7 Client-Side Firebase Config Cleaned

`src/firebase.ts` changes:
- Removed `window.__FIREBASE_DIAG` global exposure
- Removed verbose console logging of authDomain char codes
- Removed `inspectVar` diagnostic infrastructure

---

## 2. Secret Exposure Audit

| Check | Result |
|---|---|
| Secrets in built frontend bundle (`dist/assets/*.js`) | **PASS** — no secrets found |
| Secrets in `public/` directory | **PASS** — static files only |
| `.env` tracked in git | **PASS** — `.env*` in `.gitignore`, not committed |
| `.key`/`.pem`/`.cert`/`.secret` files in git | **PASS** — none found |
| Secrets in client-side source (`src/`) | **PASS** — only `VITE_FIREBASE_*` (public-by-design Firebase config) |

**Note:** The local `.env` file exists on disk with valid production secrets. It is not git-tracked but exists in the local checkout. Recommended to use `Vercel env pull` or a secret manager instead.

---

## 3. Payment Protection Audit

| Requirement | Status | Details |
|---|---|---|
| `?purchase=success` cannot unlock results | **PASS** | Only triggers "pending" UI; results require `paymentStatus === 'completed'` from Firestore |
| `paymentStatus` set server-side only | **PASS** | Set to `'pending'` by checkout route, `'completed'` by webhook only |
| Webhook signature verified | **PASS** | `verifyWebhookSignature()` called before processing |
| No client-side paymentStatus manipulation | **CONDITIONAL** | Requires Firestore security rules — client SDK can write to Firestore if rules are not deployed |

**Remaining risk:** Without Firestore security rules (issue C-1 from previous audit), a malicious authenticated user could write to their own Firestore document and set `paymentStatus: 'completed'`. Deploy `firestore.rules` to close this gap.

---

## 4. Remaining Risks

### 4.1 Critical

| ID | Risk | Why It Persists | Fix |
|---|---|---|---|
| C-1 | No Firestore security rules | Not deployed to Firebase project | Run `firebase deploy --only firestore:rules` with rules restricting user data to owner only |
| C-2 | No Storage security rules | User says "Storage rules have already been secured" | Confirm they were deployed |

### 4.2 High

| ID | Risk | Why It Persists | Fix |
|---|---|---|---|
| H-1 | Admin login uses plain-text password comparison | `ADMIN_PASSWORD` env var compared directly | Store bcrypt hash in env var instead; current approach is acceptable if env var is properly secured |

### 4.3 Medium

| ID | Risk | Why It Persists | Fix |
|---|---|---|---|
| M-1 | `CORS origin` allows any subdomain of `APP_URL` | The origin check uses `startsWith` which is permissive | Use exact match with `===` |
| M-2 | `api/validate.ts` still imports `MODEL_FALLBACKS` | Used for health checks in dev; production health endpoint is gated | Acceptable — only `{ status: 'ok' }` returned in production |
| M-3 | `.env` file exists on disk | Not git-tracked but present in checkout | Use `Vercel env pull` or secret manager |

---

## 5. Verified (Passed)

- **Frontend build:** `npm run build` — passes with zero errors
- **TypeScript:** `tsc --noEmit` — passes with zero errors
- **No secrets in client bundle:** scanned `dist/` for all known key patterns — clean
- **No secrets in git:** `.env*` gitignored, no credential files tracked
- **Payment unlock:** webhook-only; `?purchase=success` does not bypass
- **Admin routes:** all protected by `verifyAdmin` middleware
- **Rate limiting:** applied to AI, admin, login, and global endpoints
- **Helmet headers:** applied globally to all API responses
- **Debug endpoints:** all 6 removed
- **Verbose logging:** cleaned from boot sequence, firebase init, webhook handler, auth middleware
- **Client diagnostic code:** `window.__FIREBASE_DIAG` removed

---

## 6. Deployment Checklist

Before public launch:

1. Deploy Firestore security rules via `firebase deploy --only firestore:rules`
2. Confirm Storage rules are deployed
3. Remove `.env` file from local checkout (use `Vercel env pull` instead)
4. Set all required env vars in Vercel dashboard:
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
   - `GEMINI_API_KEY`
   - `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`
   - `CREEM_STARTER_PRICE_ID`, `CREEM_STANDARD_PRICE_ID`, `CREEM_PREMIUM_PRICE_ID`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `SITE_URL` (custom domain)
5. Verify `robots.txt` returns HTTP 200 at production URL
6. Verify `sitemap.xml` returns valid XML at production URL
7. Verify security headers via `curl -I https://visa-appeal.vercel.app/api/health`

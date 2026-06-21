# Backend Architecture — Phase 2 Rebuild

---

## SECTION 1: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React SPA)                         │
│                                                                     │
│  ┌────────────┐  ┌───────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ Auth UI    │  │ Wizard    │  │ Results    │  │ Dashboard     │  │
│  │ (login/    │  │ Page      │  │ Page       │  │ Page          │  │
│  │  register) │  │           │  │            │  │               │  │
│  └─────┬──────┘  └─────┬─────┘  └──────┬─────┘  └───────┬───────┘  │
│        │               │               │                │          │
│  ┌─────┴──────┐  ┌─────┴─────┐  ┌─────┴──────┐  ┌──────┴───────┐  │
│  │ Firebase   │  │ POST      │  │ Firestore  │  │ Firestore    │  │
│  │ Auth SDK   │  │ /api/     │  │ Client SDK │  │ Client SDK   │  │
│  │            │  │ analyze   │  │ (read      │  │ (query       │  │
│  │            │  │           │  │  by caseId)│  │  by uid)     │  │
│  └────────────┘  └─────┬─────┘  └──────┬─────┘  └──────────────┘  │
│                        │               │                          │
└────────────────────────┼───────────────┼──────────────────────────┘
                         │               │
                  ┌──────┴───────┐       │
                  │   Express    │       │
                  │   Server     │       │
                  │              │       │
                  │  /api/analyze│       │
                  │  /api/checkout│      │
                  │  /api/webhook│      │
                  │              │       │
                  │  Firebase    │       │
                  │  Admin SDK   │───────┘
                  │  (writes)    │
                  └──────┬──────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
       ┌────┴───┐  ┌────┴────┐  ┌───┴────┐
       │ Gemini │  │ Creem   │  │Firestore│
       │  AI    │  │  API    │  │(Admin)  │
       └────────┘  └─────────┘  └────────┘
```

**Data flow principles:**
- **Writes** → Always through Express server (Firebase Admin SDK)
- **Reads** → Direct from Firestore client SDK (authenticated with Firebase Auth)
- **Auth** → Firebase Auth client SDK on browser, token verified server-side
- **Payments** → Creem API server-side, webhook updates Firestore

---

## SECTION 2: Firestore Collections

### Collection: `users/{uid}`

```
users/{uid}
{
  email: string,
  displayName: string,
  createdAt: timestamp
}
```

Minimal profile. Created on first login via Firestore trigger or on first analysis write.

### Collection: `users/{uid}/cases/{caseId}`

**This is the single source of truth. No other collections store case or payment data.**

```
users/{uid}/cases/{caseId}
{
  caseId: string,           // auto-generated UUID
  createdAt: timestamp,     // server timestamp
  updatedAt: timestamp,     // server timestamp

  // Input
  country: string,          // e.g. "Canada"
  visaType: string,         // e.g. "Tourist", "Student"

  // Full analysis payload
  analysisData: {
    refusalReason: string,
    caseStrength: string,   // "weak" | "moderate" | "strong"
    appealLetter: string,   // Markdown/HTML
    documentChecklist: string[],
    evidenceRoadmap: string,
    weaknessAnalysis: string,
    recommendations: string[],
    countrySpecificGuidance: string,
    actionPlan: string,
    // Any other analysis fields
  },

  // Payment
  paymentStatus: "none" | "pending" | "completed" | "refunded",
  purchasedPlan: "" | "starter" | "standard" | "premium",

  // PDF storage (optional server-side, populated after purchase)
  pdfUrls: {
    starter: string,         // Firebase Storage URL or ""
    standard: string,
    premium: string
  }
}
```

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      match /cases/{caseId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        // No direct client writes — all writes go through server Admin SDK
        allow write: if false;
      }
    }
  }
}
```

Key rule: **Client reads only, no client writes.** Server Admin SDK bypasses rules.

---

## SECTION 3: API Endpoints

### `POST /api/analyze`

**Auth:** Firebase Auth ID token (Bearer header)

**Purpose:** Generate visa analysis using Gemini AI and save to Firestore.

**Request:**
```json
{
  "country": "Canada",
  "visaType": "Tourist",
  "refusalReason": "<user text>",
  "additionalContext": "<user text>",
  "intendedDuration": "...",
  "previousTravel": "...",
  "employmentStatus": "...",
  "financialInfo": "...",
  "accommodation": "...",
  "purposeOfVisit": "...",
  "tiesToHomeCountry": "..."
}
```

**Server logic:**
1. Verify Firebase Auth token → extract `uid`
2. Validate input fields
3. Generate `caseId` (uuid)
4. Call Gemini AI with structured prompt → get `analysisData`
5. Write to Firestore: `users/${uid}/cases/${caseId}` with `paymentStatus: "none"`, `purchasedPlan: ""`
6. Return `{ caseId }`

**Response:**
```json
{
  "caseId": "abc-123-def"
}
```

**Failure modes:**
- Gemini timeout/error → 503 with retry-after header
- Invalid auth token → 401
- Validation error → 400 with field details

---

### `POST /api/checkout`

**Auth:** Firebase Auth ID token (Bearer header)

**Purpose:** Create a Creem checkout session for a plan upgrade.

**Request:**
```json
{
  "caseId": "abc-123-def",
  "plan": "standard"
}
```

**Server logic:**
1. Verify Firebase Auth token → extract `uid`
2. Validate `plan` is one of `starter`, `standard`, `premium`
3. Read `users/${uid}/cases/${caseId}` from Firestore
4. Verify case exists and belongs to user
5. If already purchased (paymentStatus === "completed") → return existing
6. Call Creem API to create checkout session:
   - `metadata.uid` = uid
   - `metadata.caseId` = caseId
   - `metadata.plan` = plan
   - `success_url` = `{APP_URL}/results/{caseId}?purchase=success`
   - `cancel_url` = `{APP_URL}/results/{caseId}`
7. Update Firestore: `paymentStatus: "pending"`, `purchasedPlan: plan`
8. Return checkout URL

**Response:**
```json
{
  "checkoutUrl": "https://checkout.creem.io/..."
}
```

**Failure modes:**
- Creem API error → 502
- Case not found → 404
- Invalid plan → 400
- Auth failure → 401

---

### `POST /api/webhook`

**Auth:** Creem webhook signature (no Bearer token)

**Purpose:** Receive payment confirmation from Creem.

**Server logic:**
1. Read raw request body
2. Verify Creem webhook signature using `CREEM_WEBHOOK_SECRET`
3. Parse event payload
4. Extract `metadata.uid`, `metadata.caseId`, `metadata.plan` from checkout session
5. Extract payment status from event (`completed`, `refunded`, etc.)
6. Validate that `users/${uid}/cases/${caseId}` exists
7. Update Firestore:
   - On `payment_intent.succeeded` or `checkout.session.completed`:
     - `paymentStatus: "completed"`
     - `purchasedPlan: plan`
     - `updatedAt: now`
   - On `charge.refunded`:
     - `paymentStatus: "refunded"`
8. Return 200

**Response:** `200 OK`

**Failure modes:**
- Invalid signature → 401, do not process
- Missing metadata → log, return 200 (acknowledge receipt, prevent retry)
- Firestore write failure → return 500, Creem will retry
- Idempotency: check current `paymentStatus`, skip if already `completed`

---

### `GET /api/cases`

**Auth:** Firebase Auth ID token (Bearer header)

**Purpose:** List all cases for the authenticated user (dashboard).

**Server logic:**
1. Verify Firebase Auth token → extract `uid`
2. Query Firestore: `users/${uid}/cases` ordered by `createdAt` desc
3. Return list of cases (without full analysisData to reduce payload)

**Response:**
```json
{
  "cases": [
    {
      "caseId": "abc-123",
      "createdAt": "...",
      "country": "Canada",
      "visaType": "Tourist",
      "paymentStatus": "completed",
      "purchasedPlan": "standard"
    }
  ]
}
```

> **Alternative:** Since reads go directly through Firestore client SDK, this endpoint may be unnecessary. The dashboard can query Firestore directly. Include this endpoint as an option for future server-side filtering.

---

## SECTION 4: Webhook Flow

```
Creem                          Express Server                    Firestore
  │                                │                                │
  │  POST /api/webhook             │                                │
  │  (signed payload)              │                                │
  │ ─────────────────────────────> │                                │
  │                                │                                │
  │                                │ 1. Verify signature             │
  │                                │                                │
  │                                │ 2. Extract metadata:           │
  │                                │    {uid, caseId, plan}         │
  │                                │                                │
  │                                │ 3. Validate case exists        │
  │                                │ ────────────────────────────>  │
  │                                │ <────────────────────────────  │
  │                                │                                │
  │                                │ 4. Update paymentStatus        │
  │                                │    = "completed"               │
  │                                │    purchasedPlan = plan        │
  │                                │ ────────────────────────────>  │
  │                                │ <────────────────────────────  │
  │                                │                                │
  │  200 OK                        │                                │
  │ <───────────────────────────── │                                │
```

**Key design decisions:**
- Webhook handler is **idempotent** — check `paymentStatus` before writing
- Return **200** even on metadata errors (prevents Creem retries for bad data)
- Return **500** only on transient errors (lets Creem retry)
- No separate webhook verification endpoint — signature is validated inline

---

## SECTION 5: PDF Flow

The PDF is generated **client-side** using `html2canvas` + `jsPDF`.

```
User clicks "Download PDF" button
         │
         ▼
  Check purchasedPlan (from Firestore case doc)
         │
         ├── purchasedPlan === "" ──► Show "Purchase to unlock" overlay
         │
         └── purchasedPlan !== "" ──►
              │
              ▼
         html2canvas renders the analysis section to canvas
              │
              ▼
         jsPDF creates PDF from canvas image
              │
              ▼
         PDF downloaded via browser
```

**Future enhancement:** After purchase, server could generate PDF server-side (using `puppeteer` or `pdf-lib`), upload to Firebase Storage, and store the URL in `pdfUrls.{plan}`. This would allow download from Dashboard History without re-rendering.

**Client-side PDF is sufficient for launch.** No server-side PDF generation is required.

---

## SECTION 6: Results Page Flow

```
User navigates to /results/:caseId
         │
         ▼
  Component mounts
         │
         ├── No caseId in URL ──► Redirect to "/"
         │
         └── caseId present
              │
              ▼
         Read Firestore: users/{uid}/cases/{caseId}
         (using Firestore client SDK, onSnapshot for real-time)
              │
              ├── doc doesn't exist ──► Show "Case not found" + redirect
              │
              └── doc exists
                   │
                   ▼
              Render analysis results
                   │
                   └── Check purchasedPlan
                        │
                        ├── "" ──► Show "Unlock" buttons for Starter/Standard/Premium
                        │           (FLOW B — Checkout)
                        │
                        └── "starter" | "standard" | "premium"
                             │
                             ▼
                        Unlock content based on plan tier:
                        - Starter: document draft, basic checklist, PDF
                        - Standard: + readiness score, reapplication planner,
                          country-specific recommendations, embassy formatting
                        - Premium: + detailed refusal analysis, evidence roadmap,
                          weakness analysis, readiness outlook, complete PDF package
                             │
                             ▼
                        Enable PDF download button (FLOW 5)
```

**Key design decisions:**
- `onSnapshot` listener on results page — when webhook updates Firestore, the results page **automatically updates** without user refresh
- Case ID in URL → survives page refresh
- All data comes from single Firestore doc → no loading race conditions
- No `localStorage` or `sessionStorage` for business state

---

## SECTION 7: Dashboard Flow

```
User navigates to /dashboard
         │
         ▼
  Auth guard — if not logged in, redirect to /login
         │
         ▼
  Component mounts
         │
         ▼
  Query Firestore: users/{uid}/cases
  (ordered by createdAt desc, using Firestore client SDK)
         │
         ├── No cases ──► Show "No reports yet" + CTA to create one
         │
         └── Cases found
              │
              ▼
         Render case list with:
         - Country, visa type
         - Date created
         - Purchase status badge
         - "View Report" button → navigates to /results/:caseId
         - "Download PDF" button (only if purchasedPlan !== "")
              │
              ▼
         Click "View Report" → navigate to /results/:caseId
```

**Key design decisions:**
- Direct Firestore query — no server round-trip needed
- Only the cases subcollection is queried (user-scoped, efficient)
- No pagination needed for MVP (add later if users have 50+ cases)

---

## SECTION 8: Files to Create

### Server (new files)

| File | Purpose |
|---|---|
| `server/tsconfig.json` | TypeScript config for server |
| `server/index.ts` | Express app entry — middleware, routes, listen |
| `server/firebase.ts` | Firebase Admin SDK initialization |
| `server/middleware/auth.ts` | Firebase ID token verification middleware |
| `server/routes/analyze.ts` | `POST /api/analyze` — Gemini analysis + Firestore write |
| `server/routes/checkout.ts` | `POST /api/checkout` — Creem checkout session creation |
| `server/routes/webhook.ts` | `POST /api/webhook` — Creem webhook handler |
| `server/routes/auth.ts` | Admin login/logout endpoints |
| `server/services/gemini.ts` | Gemini AI prompt construction + API call |
| `server/services/creem.ts` | Creem API client (create checkout, verify webhook) |

### Client (new/recreated files)

| File | Purpose |
|---|---|
| `src/firebase.ts` | Firebase client SDK initialization (auth + firestore) |
| `src/context/CustomerAuthContext.tsx` | Auth context — login, register, social auth, user state |
| `src/services/api.ts` | `POST /api/analyze`, `POST /api/checkout` API client |

### Client (files to modify)

| File | Changes |
|---|---|
| `src/App.tsx` | Add `CustomerAuthProvider`, add PaymentSuccess route handler |
| `src/components/ResultsViewResolver.tsx` | Read case from Firestore by caseId from URL params |
| `src/components/ResultsDashboard.tsx` | Read `purchasedPlan` from Firestore, show unlock/purchase buttons, enable PDF |
| `src/components/customer/DashboardViews.tsx` | Query Firestore `users/{uid}/cases`, render case list |
| `src/components/customer/AuthViews.tsx` | Wire up to real Firebase Auth (currently stubbed) |
| `src/components/customer/AuthModal.tsx` | Wire up to real Firebase Auth (currently stubbed) |
| `src/components/customer/CustomerLayout.tsx` | Wire up to real auth context (currently stubbed) |
| `src/components/Header.tsx` | Show Dashboard link when logged in, Sign In when not |
| `src/components/LandingView.tsx` | Wire `handleStartClicked` to check auth — prompt login or navigate to flow |
| `src/components/AppFlow.tsx` | Restore auth guard — require login before wizard |
| `src/components/CaseWizard.tsx` | On submit, call `POST /api/analyze`, navigate to `/results/{caseId}` |

---

## SECTION 9: Files NOT to Recreate

These files have **no backend dependencies** and should remain unchanged:

| File | Reason |
|---|---|
| `src/types.ts` | Type definitions — no backend deps |
| `src/types/seo.ts` | SEO types — no backend deps |
| `src/data/sampleData.ts` | Sample report data — client-only |
| `src/data/seoGuides.ts` | Static guide content — client-only |
| `src/data/seoGuidesBatch2.ts` | Static guide content — client-only |
| `src/data/seoGuidesBatch3.ts` | Static guide content — client-only |
| `src/utils/seoSchemas.ts` | Schema.org helpers — client-only |
| `src/components/SEO.tsx` | SEO component — no backend deps |
| `src/components/Logo.tsx` | Logo component — pure UI |
| `src/components/Footer.tsx` | Footer component — pure UI |
| `src/components/ErrorBoundary.tsx` | Error boundary — pure UI |
| `src/components/WorldMapBackground.tsx` | Background animation — pure UI |
| `src/components/TrustSection.tsx` | Trust section — pure UI |
| `src/components/ShowcaseSection.tsx` | Showcase — pure UI |
| `src/components/WhyChooseUsView.tsx` | Static page — pure UI |
| `src/components/HowItWorksAnimations.tsx` | Animations — pure UI |
| `src/components/SampleReportView.tsx` | Sample report display — uses local data |
| `src/components/ProcessingView.tsx` | Processing animation — pure UI |
| `src/components/TermsView.tsx` | Static page — pure UI |
| `src/components/RefundView.tsx` | Static page — pure UI |
| `src/components/PrivacyPolicyView.tsx` | Static page — pure UI |
| `src/components/ContactUsView.tsx` | Contact form — pure UI |
| `src/components/AboutUsView.tsx` | Static page — pure UI |
| `src/components/SeoGuideView.tsx` | Guide display — pure UI |
| `src/components/admin/RichTextEditor.tsx` | Rich text editor — no backend calls |
| `vite.config.ts` | Build config — no backend deps |
| `tsconfig.json` | TypeScript config — no backend deps |
| `tailwind.config.js` | Tailwind config — no backend deps |
| `postcss.config.js` | PostCSS config — no backend deps |
| `index.html` | Entry point — no backend deps |

---

## SECTION 10: Potential Failure Points and Prevention

| # | Failure Point | Scenario | Prevention |
|---|---|---|---|
| 1 | **Firebase Auth token expires** | User leaves tab open for days | Firestore client SDK handles token refresh automatically. `onAuthStateChanged` listener updates state. Results page re-fetches on auth change. |
| 2 | **Firestore read fails** | Network disconnected | Client SDK retries. Show loading spinner. `onSnapshot` reconnects automatically. Case ID in URL — survives full page reload. |
| 3 | **Analysis generation fails** | Gemini API timeout | Server returns 503. Client shows error with "Try Again" button. |
| 4 | **Analysis written but Gemini response partial** | Gemini returns incomplete data | Server validates response before writing. Reject and retry if missing required fields. |
| 5 | **Creem checkout creation fails** | Creem API down | Return 502 to client. Show error message: "Payment system unavailable, please try again later." |
| 6 | **Webhook never arrives** | Creem outage, network issue | Creem retries webhooks for up to 3 days with exponential backoff. Idempotent handler handles duplicates. |
| 7 | **Webhook arrives before user returns to results page** | Payment processing delay | Results page uses `onSnapshot` — Firestore update triggers automatic UI refresh. No polling needed. |
| 8 | **User clicks Unlock, pays, redirected back but Firestore not yet updated** | Webhook still processing | `onSnapshot` listener on the results page will pick up the update within ~1 second. Show "Payment received, unlocking..." state. |
| 9 | **User pays for same case twice** | Clicks Unlock again | Server checks `paymentStatus` before creating checkout. If already `completed`, return existing checkout URL or show "Already purchased." |
| 10 | **User logs out, logs in with different account** | Different uid, can't see old cases | Expected behavior — each account has its own `users/{uid}/cases/`. If user needs cross-account access, implement case transfer later. |
| 11 | **User opens results page without auth** | No uid available | Auth guard in `AppFlow.tsx` redirects to login. Results page checks auth and redirects. |
| 12 | **Tampered caseId in URL** | User tries to access another user's case | Firestore query is scoped to `users/{uid}/cases/{caseId}` — other user's case is inaccessible. Security rules enforce this. |
| 13 | **Race condition: two simultaneous webhooks for same case** | Creem sends duplicate | Webhook handler checks `paymentStatus` before writing. Skip if already `completed`. Firestore transaction ensures atomicity. |
| 14 | **PDF generation fails client-side** | html2canvas or jsPDF error | Show error message with "Try Again" button. PDF is regenerated fresh each time — no state to corrupt. |
| 15 | **Browser crash during analysis** | User loses form input | Form state could be saved to Firestore as draft (future enhancement). For MVP, user re-enters data. |
| 16 | **Multiple tabs open, purchase in one tab** | Other tab stale | `onSnapshot` in results page updates all open tabs automatically. Dashboard uses `onSnapshot` to reflect new purchases. |
| 17 | **Free tier Creem webhook verification fails** | Wrong secret | Store secret in environment variable. Log verification failures. Monitor via health check endpoint. |
| 18 | **CaseId collision** | Two users get same UUID | Use `uuid` v4 with sufficient entropy (122 random bits). Collision probability is negligible. |

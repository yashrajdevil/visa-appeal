import express from "express";
import path from "path";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { requireCustomerAuth } from "./src/server/customerAuthRoutes.js";
import { adminDb } from "./src/server/firebaseAdmin.js";

import { authRouter, requireAuth } from "./src/server/authRoutes.js";
import { blogRouter } from "./src/server/blogRoutes.js";
import { customerAuthRouter } from "./src/server/customerAuthRoutes.js";
import { creemRouter, creemWebhookRouter } from "./src/server/creemRoutes.js";

async function initializeAdminUser() {}

async function startServer() {
  await initializeAdminUser();

  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  // Mount webhooks before generic json parser (if raw body is needed)
  app.use("/api/webhooks", creemWebhookRouter);

  // Increase payload limit for base64 file uploads
  app.use(express.json({ limit: '50mb' }));

  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Mount internal API routes
  app.use("/api/auth", authRouter);
  app.use("/api/blog-app/admin", requireAuth);
  app.use("/api/blog-app", blogRouter);

  // Mount SaaS Customer API routes
  app.use("/api/customer/auth", customerAuthRouter);
  app.use("/api/payments", creemRouter);

  // API Routes
  app.post("/api/generate", requireCustomerAuth, async (req, res) => {
    const submissionId = Math.random().toString(36).substring(2, 10);
    const userId = (req as any).user?.id || 'unknown';
    
    console.log(`\n\n=== STARTING NEW ANALYSIS REQUEST [ID:${submissionId}] ===`);
    console.log(`STEP 1 - Request received from user: ${userId}`);

    try {
      console.log(`STEP 2 - Checking environment variables`);
      let apiKey;
      try {
        apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing GEMINI_API_KEY environment variable");
        }
      } catch (envErr: any) {
        console.error(`FAILED AT STEP 2 (Auth/Env)`, envErr);
        return res.status(500).json({ error: "Missing GEMINI_API_KEY environment variable", details: envErr.message });
      }

      console.log(`STEP 3 - Parsing payload and validating file object`);
      let ai;
      let payloadContent;
      try {
        ai = new GoogleGenAI({ apiKey });
        const { country, visaType, purpose, travelHistory, fileBase64, mimeType, refusalReasons, questionnaireResponses } = req.body;
        
        if (!fileBase64) {
          throw new Error("No document provided (fileBase64 missing)");
        }

        const base64Data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
        
        const formattedQuestions = questionnaireResponses ? Object.entries(questionnaireResponses).map(([_, q]: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n') : 'Not provided';
        const formattedReasons = refusalReasons ? refusalReasons.join(', ') : 'Extract from letter';

        payloadContent = {
          base64Data,
          mimeType: mimeType || "application/pdf",
          promptParts: { country, visaType, purpose, travelHistory, formattedReasons, formattedQuestions }
        };
      } catch (payloadErr: any) {
        console.error(`FAILED AT STEP 3 (Payload parsing)`, payloadErr);
        return res.status(400).json({ error: "Payload parsing failed", details: payloadErr.message });
      }

      console.log(`STEP 4 - Constructing Gemini prompt`);
      let prompt;
      let responseSchema;
      try {
        prompt = `Analyze this visa refusal document and the applicant's context to generate a comprehensive professional reapplication preparation package.

CRITICAL RULE: NEVER INVENT FACTS. You must never generate statements that were not provided by the user (e.g. do not say "I have attached updated bank statements" unless the user explicitly provided them). Instead use conditional language (e.g. "If updated funds are available, supporting bank statements should be submitted").

Applicant Context:
- Destination Country: ${payloadContent.promptParts.country}
- Visa Type: ${payloadContent.promptParts.visaType}
- Primary Purpose: ${payloadContent.promptParts.purpose}
- Travel History: ${payloadContent.promptParts.travelHistory || 'Not provided'}
- Identified Refusal Reasons: ${payloadContent.promptParts.formattedReasons}
- Applicant Questionnaire Responses (Crucial context for the reapplication):
${payloadContent.promptParts.formattedQuestions}

Follow these rules for generation:
1. Provide a Case Assessment with an Application Readiness Score (0-100), Severity Rating (Critical, High Risk, Moderate, Strong), Case Type (e.g., Financial Refusal), Consultant Notes (practical observations), an AI Assessment Summary (currentCaseStrength, recommendedPath, reasoning, confidenceLevel), and a Readiness Outlook (currentReadiness, readinessAfterFixes, expectedScoreImprovement, primaryObstacles). Also extract the Applicant Name (use "Confidential Client" if not found from the refusal upload). Use the exact following scale for Severity Rating: 0-39 = Critical, 40-59 = High Risk, 60-79 = Moderate, 80-100 = Strong.
2. Provide a structured Issue Breakdown: for each refusal reason, state the finding, impact (High/Medium/Low/Critical), recommended evidence, and a recommended action.
3. Map an exact strategy with: immediateActions, evidenceToGather, commonMistakes, timeline, and expectedOutcome.
4. Provide a categorized document checklist (financial, employment, academic, travel, identity, other) where each item includes a short explanation.
5. Draft a fully professional, serious, and formatted supporting explanation draft.
   - Keep it concise, direct, and evidence-focused. Max 4-6 major sections. Short paragraphs. Reduce length by 30% by eliminating apologies, filler phrases, and unnecessary introductions.
   - Use clear formatting: Date, Recipient, Subject, Greeting, Introduction, Numbered refusal response sections, Conclusion, Signature.
   - Separate paragraphs with blank lines.`;

        responseSchema = {
          type: Type.OBJECT,
          properties: {
            case_assessment: {
              type: Type.OBJECT,
              properties: {
                applicantName: { type: Type.STRING },
                score: { type: Type.INTEGER, description: "Application readiness score 0-100" },
                severityRating: { type: Type.STRING, enum: ['Critical', 'High Risk', 'Moderate', 'Strong'] },
                caseType: { type: Type.STRING },
                consultantNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                consultantVerdict: {
                  type: Type.OBJECT,
                  properties: {
                    currentCaseStrength: { type: Type.STRING, enum: ['Critical', 'High Risk', 'Moderate', 'Strong'] },
                    recommendedPath: { type: Type.STRING, enum: ['Administrative Review', 'Fresh Application', 'Appeal'] },
                    reasoning: { type: Type.STRING },
                    confidenceLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                  },
                  required: ["currentCaseStrength", "recommendedPath", "reasoning", "confidenceLevel"]
                },
                successOutlook: {
                  type: Type.OBJECT,
                  properties: {
                    currentReadiness: { type: Type.STRING, enum: ['Low', 'Moderate', 'Strong'] },
                    readinessAfterFixes: { type: Type.STRING, enum: ['Low', 'Moderate', 'Strong'] },
                    expectedScoreImprovement: { type: Type.STRING },
                    primaryObstacles: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["currentReadiness", "readinessAfterFixes", "expectedScoreImprovement", "primaryObstacles"]
                }
              },
              required: ["applicantName", "score", "severityRating", "caseType", "consultantNotes", "consultantVerdict", "successOutlook"]
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING },
                  finding: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
                  recommendedEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedAction: { type: Type.STRING }
                },
                required: ["issue", "finding", "impact", "recommendedEvidence", "recommendedAction"]
              }
            },
            strategy: {
              type: Type.OBJECT,
              properties: {
                immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                evidenceToGather: { type: Type.ARRAY, items: { type: Type.STRING } },
                commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING },
                expectedOutcome: { type: Type.STRING }
              },
              required: ["immediateActions", "evidenceToGather", "commonMistakes", "timeline", "expectedOutcome"]
            },
            checklist: {
              type: Type.OBJECT,
              properties: {
                financial: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["item", "explanation"] } },
                employment: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["item", "explanation"] } },
                academic: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["item", "explanation"] } },
                travel: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["item", "explanation"] } },
                identity: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["item", "explanation"] } },
                other: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["item", "explanation"] } }
              },
              required: ["financial", "employment", "academic", "travel", "identity", "other"]
            },
            appeal_letter: { type: Type.STRING, description: "The complete formatted supporting explanation draft" }
          },
          required: ["case_assessment", "issues", "strategy", "checklist", "appeal_letter"]
        };
      } catch (promptErr: any) {
        console.error(`FAILED AT STEP 4 (Prompt creation)`, promptErr);
        return res.status(500).json({ error: "Failed to construct prompt", details: promptErr.message });
      }

      console.log(`STEP 5 - Gemini request started`);
      let response;
      try {
        let retries = 0;
        let lastError;
        
        while (retries < 3) {
          try {
            console.log(`Attempt ${retries + 1} to call Gemini API...`);
            response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: payloadContent.mimeType,
                        data: payloadContent.base64Data
                      }
                    },
                    { text: prompt }
                  ]
                }
              ],
              config: {
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0.2
              }
            });
            
            if (!response.text) throw new Error("Unexpected empty response from Gemini API");
            console.log(`Gemini API call successful on attempt ${retries + 1}`);
            break; // Success!
          } catch (err: any) {
            console.warn(`Gemini API call failed on attempt ${retries + 1}:`, err.message);
            lastError = err;
            retries++;
            if (retries < 3) {
               await new Promise(r => setTimeout(r, 2000));
            }
          }
        }

        if (!response || !response.text) {
          throw new Error(`Analysis Generation Failed (ERR_AI_TIMEOUT). Last error: ${lastError?.message}`);
        }
      } catch (geminiErr: any) {
        console.error(`FAILED AT STEP 5 (Gemini request)`, geminiErr);
        return res.status(502).json({ error: "AI Analysis failed", details: String(geminiErr.message || geminiErr) });
      }

      console.log(`STEP 6 - Parsing Gemini response`);
      let resultJSON;
      try {
        resultJSON = JSON.parse(response.text);
      } catch (parseErr: any) {
        console.error(`FAILED AT STEP 6 (JSON parse error)`, parseErr);
        return res.status(500).json({ error: "Failed to parse AI response as JSON", details: parseErr.message });
      }

      console.log(`STEP 7 - Response generated successfully, saving to Firestore`);
      try {
        const uid = (req as any).user.id;
        const caseRef = adminDb.collection('users').doc(uid).collection('cases').doc();
        
        await caseRef.set({
          caseId: caseRef.id,
          createdAt: Date.now(),
          analysisData: response.text, // raw JSON string
          analysisJson: resultJSON, // parsed JSON object
          case_assessment: resultJSON.case_assessment,
          issues: resultJSON.issues,
          strategy: resultJSON.strategy,
          checklist: resultJSON.checklist,
          appeal_letter: resultJSON.appeal_letter,
          country: req.body.country || "Unknown",
          visaType: req.body.visaType || "Unknown",
          refusalReasonsJson: JSON.stringify(req.body.refusalReasons || []),
          questionnaireResponsesJson: JSON.stringify(req.body.questionnaireResponses || {}),
          purchasedPlan: null,
          paymentStatus: "pending",
          pdfUrls: {
            starter: "",
            standard: "",
            premium: ""
          }
        });

        console.log(`CASE CREATED: ${caseRef.id}`);
        console.log(`CASE SAVED: ${caseRef.id}`);

        res.json({ caseId: caseRef.id });
        console.log(`=== ANALYSIS COMPLETED SUCCESSFULLY [ID:${submissionId}, CASE:${caseRef.id}] ===\n`);
      } catch (returnErr: any) {
        console.error(`FAILED AT STEP 7 (Return Error)`, returnErr);
        throw returnErr;
      }
    } catch (globalError: any) {
      console.error(`=== GLOBAL FALLBACK ERROR CAUGHT [ID:${submissionId}] ===\n`, globalError);
      if (!res.headersSent) {
        res.status(500).json({ error: "Unexpected server error during analysis", details: globalError.message || String(globalError) });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[${new Date().toISOString()}] Global error handler caught:`, err);
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: "File too large. Please upload a smaller document." });
    }
    res.status(err.status || 500).json({ error: err.message || "An unexpected server error occurred." });
  });

    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
      // In serverless environments, we don't start the listener
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }

    return app;
}

const appPromise = startServer();
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  app(req, res);
}


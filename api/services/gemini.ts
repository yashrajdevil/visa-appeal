export const MODEL_FALLBACKS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

let lastSuccessfulModel: string | null = null;

export function getModelDiagnostics() {
  return {
    primaryModel: MODEL_FALLBACKS[0],
    fallbacks: MODEL_FALLBACKS,
    lastSuccessfulModel,
  };
}

function isRetryableError(status: number, errorBody: string): boolean {
  if (status === 429 || status === 503 || status === 404) return true;
  if (errorBody.includes('UNAVAILABLE')) return true;
  if (errorBody.includes('RESOURCE_EXHAUSTED')) return true;
  if (errorBody.includes('NOT_FOUND') || errorBody.includes('not found') || errorBody.includes('does not exist')) return true;
  return false;
}

async function generateWithFallback(
  prompt: string,
  generationConfig: { temperature: number; maxOutputTokens: number }
): Promise<{ text: string; model: string }> {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) throw new Error('GEMINI_API_KEY is not configured');

  const trimmedKey = rawKey.trim();

  const attempts: { model: string; status: number | null; error: string | null }[] = [];

  for (const model of MODEL_FALLBACKS) {
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    });
    const fullUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

    console.log(`FALLBACK attempting model=${model}`);
    console.log(`FALLBACK URL (redacted): ${fullUrl.replace(trimmedKey, '***REDACTED***')}`);

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': trimmedKey },
        body: requestBody,
      });

      console.log(`FALLBACK response status=${response.status} model=${model}`);
      console.log(`FALLBACK response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      const rawBody = await response.text();

      if (response.ok) {
        console.log(`FALLBACK success model=${model}`);
        lastSuccessfulModel = model;
        // Parse API response envelope to extract generated text from candidates
        try {
          const parsed = JSON.parse(rawBody);
          const extractedText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || rawBody;
          console.log(`FALLBACK extracted text length: ${extractedText.length}`);
          return { text: extractedText, model };
        } catch (parseErr: any) {
          // Fall through to regular text if JSON parsing fails
          console.log(`FALLBACK could not parse response JSON, using raw body`);
          return { text: rawBody, model };
        }
      }

      console.log(`FALLBACK error body (first 2000) for model=${model}: ${rawBody.slice(0, 2000)}`);
      attempts.push({ model, status: response.status, error: rawBody.slice(0, 500) });

      if (!isRetryableError(response.status, rawBody)) {
        throw new Error(`Gemini API error (${model}): ${response.status} ${rawBody.slice(0, 2000)}`);
      }

      console.log(`FALLBACK retryable error on model=${model}, moving to next`);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        console.log(`FALLBACK parse error model=${model}: ${err.message}`);
        attempts.push({ model, status: null, error: err.message });
        continue;
      }
      if (err.message?.startsWith('Gemini API error (')) {
        throw err;
      }
      console.log(`FALLBACK exception model=${model}: ${err.message}`);
      attempts.push({ model, status: null, error: err.message });
    }
  }

  const summary = attempts.map(a => `${a.model}: status=${a.status}, error="${a.error?.slice(0, 200)}"`).join(' | ');
  throw new Error(`All Gemini models failed: ${summary}`);
}

export async function generateAnalysis(formData: {
  country: string;
  visaType: string;
  purpose: string;
  travelHistory: string;
  refusalReasons: string[];
  questionnaireResponses: { question: string; answer: string | boolean | string[] }[];
}) {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const trimmedKey = rawKey.trim();
  const prompt = buildPrompt(formData);
  const { text } = await generateWithFallback(prompt, { temperature: 0.7, maxOutputTokens: 8192 });

  const json = extractJson(text);

  if (!json) {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  return json;
}

function buildPrompt(formData: {
  country: string;
  visaType: string;
  purpose: string;
  travelHistory: string;
  refusalReasons: string[];
  questionnaireResponses: { question: string; answer: string | boolean | string[] }[];
}): string {
  const questionnaireText = formData.questionnaireResponses
    .map(r => `${r.question}: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`)
    .join('\n');

  return `You are a senior visa appeal consultant. Analyze this visa refusal case and generate a comprehensive professional appeal package.

Country: ${formData.country}
Visa Type: ${formData.visaType}
Purpose of Visit: ${formData.purpose}
Travel History: ${formData.travelHistory}
Refusal Reasons: ${formData.refusalReasons.join(', ')}

Additional Information:
${questionnaireText}

Generate a detailed JSON analysis with exactly this structure. Do not include markdown code fences. Return raw JSON only:

{
  "case_assessment": {
    "applicantName": "Applicant",
    "score": 65,
    "severityRating": "Moderate",
    "caseType": "${formData.visaType}",
    "consultantNotes": ["Analysis of key case factors and observations"],
    "consultantVerdict": {
      "currentCaseStrength": "Moderate",
      "recommendedPath": "Fresh Application",
      "reasoning": "Detailed reasoning based on the refusal grounds",
      "confidenceLevel": "Medium"
    },
    "successOutlook": {
      "currentReadiness": "Low",
      "readinessAfterFixes": "Strong",
      "expectedScoreImprovement": "30-40%",
      "primaryObstacles": ["List top obstacles"]
    }
  },
  "issues": [
    {
      "issue": "Specific refusal ground",
      "finding": "Detailed finding",
      "impact": "High",
      "recommendedEvidence": ["Evidence item 1", "Evidence item 2"],
      "recommendedAction": "Specific action to address this issue"
    }
  ],
  "strategy": {
    "immediateActions": ["Action 1", "Action 2"],
    "evidenceToGather": ["Document 1", "Document 2"],
    "commonMistakes": ["Mistake 1", "Mistake 2"],
    "timeline": "Recommended timeline for reapplication",
    "expectedOutcome": "Expected outcome after following recommendations"
  },
  "checklist": {
    "financial": [{"item": "Bank statements (6 months)", "explanation": "Why this is needed"}],
    "employment": [],
    "academic": [],
    "travel": [],
    "identity": [],
    "other": []
  },
  "appeal_letter": "Full formal appeal letter in markdown format addressing the specific refusal grounds, presenting evidence, and making the case for reconsideration."
}`;
}

function extractJson(text: string): any {
  let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  cleaned = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

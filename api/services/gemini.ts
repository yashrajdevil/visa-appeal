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
  generationConfig: { temperature: number; maxOutputTokens: number; responseMimeType?: string }
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
  refusalDocument?: string;
}) {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const trimmedKey = rawKey.trim();
  const prompt = buildPrompt(formData);
  const { text, model } = await generateWithFallback(prompt, {
    temperature: 0.7,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  });

  console.log('RAW GEMINI RESPONSE (first 5000):', text.slice(0, 5000));
  console.log('RAW GEMINI RESPONSE length:', text.length);
  console.log('RAW GEMINI RESPONSE model:', model);

  const json = extractJson(text);

  if (!json) {
    console.error('FAILED TO PARSE JSON. Full raw response:');
    console.error(text);
    console.error('Response length:', text.length);
    console.error('Model:', model);
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
  refusalDocument?: string;
}): string {
  const questionnaireText = formData.questionnaireResponses
    .map(r => `${r.question}: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`)
    .join('\n');

  const refusalDocText = formData.refusalDocument
    ? `\nVisa Refusal Letter:\n${formData.refusalDocument}`
    : '';

  return `SYSTEM OBJECTIVE

You are a senior immigration case analyst and visa reapplication consultant.

Your task is to analyze a visa refusal letter together with the applicant questionnaire and generate a professional reapplication preparation package.

CRITICAL RULES

1. NEVER INVENT FACTS.

Do not claim the applicant possesses documents, funds, employment, assets, travel history, sponsorship, invitations, or evidence unless explicitly provided.

Forbidden example:

"I have attached updated bank statements."

if no updated bank statements were provided.

Required example:

"If updated financial evidence is available, supporting bank statements should be submitted."

2. NEVER fabricate:

* dates
* account balances
* property ownership
* employment details
* education details
* family ties
* travel history
* supporting evidence

3. When evidence is missing:

* identify the gap
* explain why it matters
* recommend evidence

Do not pretend the evidence exists.

---

INPUTS

Destination Country:
${formData.country}

Visa Type:
${formData.visaType}

Purpose:
${formData.purpose}

Travel History:
${formData.travelHistory}

Refusal Reasons:
${formData.refusalReasons.join(', ')}

Applicant Questionnaire:
${questionnaireText}
${refusalDocText}

---

OUTPUT REQUIREMENTS

Return structured JSON.

---

SECTION 1
CASE ASSESSMENT
---------------

Generate:

applicationReadinessScore
(0-100)

severityRating

Scale:

0-39 = Critical
40-59 = High Risk
60-79 = Moderate
80-100 = Strong

caseType

Examples:

Financial Refusal
Purpose of Visit Refusal
Ties to Home Country Refusal
Documentation Refusal
Multiple Ground Refusal

consultantNotes

3-8 practical observations.

---

SECTION 2
AI ASSESSMENT SUMMARY
---------------------

Generate:

currentCaseStrength

recommendedPath

One of:

Reapply Immediately

Reapply After Strengthening Evidence

Delay Application

Seek Professional Review

reasoning

confidenceLevel

0-100

---

SECTION 3
READINESS OUTLOOK
-----------------

Generate:

currentReadiness

readinessAfterFixes

expectedScoreImprovement

primaryObstacles

---

SECTION 4
ISSUE BREAKDOWN
---------------

For each refusal ground generate:

finding

impact

Values:

Critical
High
Medium
Low

recommendedEvidence

recommendedAction

---

SECTION 5
REAPPLICATION STRATEGY
----------------------

Generate:

immediateActions

evidenceToGather

commonMistakes

timeline

expectedOutcome

---

SECTION 6
DOCUMENT CHECKLIST
------------------

Generate categorized checklist.

Categories:

financial

employment

academic

travel

identity

other

Each item must contain:

documentName

importance

explanation

---

SECTION 7
PROFESSIONAL EXPLANATION LETTER
-------------------------------

Generate a consultant-grade supporting explanation.

Requirements:

* concise
* evidence-focused
* professional
* serious tone

Structure:

Date

Recipient

Subject

Greeting

Introduction

Numbered Refusal Response Sections

Conclusion

Signature

Formatting rules:

* short paragraphs
* blank line separation
* maximum 4-6 major sections
* remove apologies
* remove filler language
* reduce verbosity by approximately 30%

Do not include markdown symbols:

#

##

###

---

---

Use plain professional formatting only.

---

SECTION 8
APPLICANT NAME
--------------

Extract applicantName from uploaded refusal document.

If unavailable:

"Confidential Client"

---

FINAL RULE

Return only information supported by:

1. refusal letter
2. questionnaire
3. supplied applicant context

Never fabricate evidence.

---

IMPORTANT: Return ONLY valid JSON.
Do not wrap in markdown.
Do not use \`\`\`json.
Do not include explanations before or after JSON.
Use exactly this JSON structure:

{
  "case_assessment": {
    "applicantName": "Confidential Client",
    "applicationReadinessScore": 0,
    "severityRating": "Moderate",
    "caseType": "${formData.visaType}",
    "consultantNotes": ["Note 1", "Note 2"]
  },
  "aiAssessmentSummary": {
    "currentCaseStrength": "Moderate",
    "recommendedPath": "Reapply After Strengthening Evidence",
    "reasoning": "Detailed reasoning",
    "confidenceLevel": 65
  },
  "readinessOutlook": {
    "currentReadiness": "Low",
    "readinessAfterFixes": "Strong",
    "expectedScoreImprovement": "30-40%",
    "primaryObstacles": ["Obstacle 1", "Obstacle 2"]
  },
  "issues": [
    {
      "issue": "Specific refusal ground",
      "finding": "Detailed finding",
      "impact": "High",
      "recommendedEvidence": ["Evidence item 1"],
      "recommendedAction": "Specific action to address this issue"
    }
  ],
  "strategy": {
    "immediateActions": ["Action 1", "Action 2"],
    "evidenceToGather": ["Document 1", "Document 2"],
    "commonMistakes": ["Mistake 1", "Mistake 2"],
    "timeline": "Recommended timeline",
    "expectedOutcome": "Expected outcome"
  },
  "checklist": {
    "financial": [{"documentName": "Bank statements", "importance": "Critical", "explanation": "Why this is needed"}],
    "employment": [],
    "academic": [],
    "travel": [],
    "identity": [],
    "other": []
  },
  "explanationLetter": "Consultant-grade supporting explanation in plain professional formatting without markdown symbols."
}`;
}

function extractJson(text: string): any {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // If no braces found, full dump has already been logged upstream
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    console.error('extractJson: no JSON object found in response');
    return null;
  }
  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch (parseErr: any) {
    console.error('extractJson: JSON.parse failed:', parseErr.message);
    console.error('extractJson: cleaned text length:', cleaned.length);
    console.error('extractJson: cleaned text (first 2000):', cleaned.slice(0, 2000));
    return null;
  }
}

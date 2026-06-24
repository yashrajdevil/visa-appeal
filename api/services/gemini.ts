export const MODEL_FALLBACKS = [
  'gemini-3.5-flash',       // Preferred model
  'gemini-2.5-flash',       // High-quality fallback
  'gemini-3.1-flash-lite',  // Last-resort lightweight fallback
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

  for (const [index, model] of MODEL_FALLBACKS.entries()) {
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    });
    const fullUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

    console.log(`FALLBACK attempting model=${model} (${index + 1}/${MODEL_FALLBACKS.length})`);
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
        console.log(`FALLBACK selected model=${model} after ${index + 1} attempt(s)`);
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
    temperature: 0.3,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  });

  console.log('RAW RESPONSE LENGTH', text.length);
  console.log(text);
  console.log('RAW GEMINI RESPONSE model:', model);

  const json = extractJson(text);

  if (!json) {
    console.error('FAILED TO PARSE JSON. Full raw response:');
    console.error(text);
    console.error('Response length:', text.length);
    console.error('Model:', model);
    throw new Error('Failed to parse Gemini response as JSON');
  }

  return normalizeAnalysisOutput(json);
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
  }
}`;
}

function normalizeAnalysisOutput(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  const ca = raw.case_assessment || {};

  // Transform aiAssessmentSummary at root level into case_assessment.consultantVerdict
  const summary = raw.aiAssessmentSummary || ca.aiAssessmentSummary || {};
  const outlook = raw.readinessOutlook || ca.readinessOutlook || {};

  return {
    case_assessment: {
      applicantName: ca.applicantName || raw.applicantName || 'Confidential Client',
      score: ca.score ?? ca.applicationReadinessScore ?? raw.applicationReadinessScore ?? 0,
      severityRating: ca.severityRating || 'Moderate',
      caseType: ca.caseType || raw.caseType || '',
      consultantNotes: ca.consultantNotes || raw.consultantNotes || [],
      consultantVerdict: {
        currentCaseStrength: summary.currentCaseStrength || ca.consultantVerdict?.currentCaseStrength || 'Moderate',
        recommendedPath: summary.recommendedPath || ca.consultantVerdict?.recommendedPath || 'Fresh Application',
        reasoning: summary.reasoning || ca.consultantVerdict?.reasoning || '',
        confidenceLevel: summary.confidenceLevel ?? ca.consultantVerdict?.confidenceLevel ?? 'Medium',
      },
      successOutlook: {
        currentReadiness: outlook.currentReadiness || ca.successOutlook?.currentReadiness || 'Low',
        readinessAfterFixes: outlook.readinessAfterFixes || ca.successOutlook?.readinessAfterFixes || 'Strong',
        expectedScoreImprovement: outlook.expectedScoreImprovement || ca.successOutlook?.expectedScoreImprovement || 'N/A',
        primaryObstacles: outlook.primaryObstacles || ca.successOutlook?.primaryObstacles || [],
      },
    },
    issues: raw.issues || [],
    strategy: raw.strategy || {
      immediateActions: [],
      evidenceToGather: [],
      commonMistakes: [],
      timeline: '',
      expectedOutcome: '',
    },
    checklist: normalizeChecklist(raw.checklist),
    appeal_letter: '',
  };
}

function normalizeChecklist(cl: any): any {
  if (!cl || typeof cl !== 'object') {
    return { financial: [], employment: [], academic: [], travel: [], identity: [], other: [] };
  }
  const result: any = {};
  for (const category of ['financial', 'employment', 'academic', 'travel', 'identity', 'other']) {
    const items = cl[category];
    if (!Array.isArray(items)) {
      result[category] = [];
      continue;
    }
    result[category] = items.map((item: any) => ({
      item: item.item ?? item.documentName ?? '',
      explanation: item.explanation ?? item.importance ?? '',
    }));
  }
  return result;
}

function extractJson(text: string): any {
  console.log('JSON extraction start');

  const start = text.indexOf('{');
  if (start === -1) {
    console.error('extractJson: no JSON object found in response');
    throw new Error('Model returned invalid JSON');
  }

  // Balanced brace extraction with string/escape awareness
  let depth = 0;
  let insideString = false;
  let pos = start;
  for (; pos < text.length; pos++) {
    const ch = text[pos];
    if (insideString) {
      if (ch === '\\') {
        pos++; // skip escaped character
        continue;
      }
      if (ch === '"') insideString = false;
      continue;
    }
    if (ch === '"') {
      insideString = true;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) break;
  }

  if (depth !== 0) {
    console.error('extractJson: unbalanced braces in response');
    throw new Error('Model returned invalid JSON');
  }

  const json = text.slice(start, pos + 1);
  console.log('JSON extraction end');
  console.log('Extracted JSON length:', json.length);

  try {
    return JSON.parse(json);
  } catch (parseErr: any) {
    console.error('extractJson: JSON.parse failed:', parseErr.message);
    console.error('extractJson: last 500 chars of extracted JSON:', json.slice(-500));
    console.error('Extracted JSON length:', json.length);
    throw new Error('Model returned invalid JSON');
  }
}

export async function generateAppealLetter(
  analysisData: any,
  formData: {
    country: string;
    visaType: string;
    purpose: string;
    travelHistory: string;
    refusalReasons: string[];
    questionnaireResponses: { question: string; answer: string | boolean | string[] }[];
    refusalDocument?: string;
  }
): Promise<string> {
  const questionnaireText = formData.questionnaireResponses
    .map(r => `${r.question}: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`)
    .join('\n');

  const refusalDocText = formData.refusalDocument
    ? `\nRefusal Letter Text:\n${formData.refusalDocument}`
    : '';

  const analysisSummary = [
    `Case Type: ${analysisData.case_assessment?.caseType || formData.visaType}`,
    `Readiness Score: ${analysisData.case_assessment?.score || 'N/A'}/100`,
    `Severity: ${analysisData.case_assessment?.severityRating || 'N/A'}`,
    `Case Strength: ${analysisData.case_assessment?.consultantVerdict?.currentCaseStrength || 'N/A'}`,
    `Key Issues: ${(analysisData.issues || []).map((i: any) => i.issue).join(', ')}`,
  ].join('\n');

  const prompt = `Generate a visa reapplication cover letter.

LENGTH: 350 to 700 words. Never exceed 900 words.

STRUCTURE:

Immigration, Refugees and Citizenship Canada

Subject: Reapplication for [Visa Type]

Dear Visa Officer,

Opening paragraph - directly acknowledge the refusal and state this is a reapplication.

Numbered refusal-response sections. Create only sections relevant to the refusal reasons:

1. Financial Capacity
2. Employment / Ties
3. Purpose of Visit

Short conclusion - respectfully request reconsideration.

Applicant Name

STYLE:

Write like an immigration consultant, visa caseworker, or professional applicant — NOT like a lawyer, barrister, or litigation counsel.

NEVER USE THESE PHRASES:

- balance of probabilities
- statutory requirements
- jurisprudence
- legal standard
- the refusal places significant weight
- economic integration
- compelling incentive
- objective evidence establishes
- for the reasons outlined above
- professional obligations create
- holistic assessment
- "We believe"
- "I kindly request"
- "I promise"
- "The applicant submits"
- "This submission demonstrates"
- "Under Section"
- IRPA or immigration act references

NEVER INVENT FACTS. Use only the refusal reasons, questionnaire answers, and refusal document provided below. If information is missing, omit it entirely — do not create placeholders or bracketed fields.

NEVER OUTPUT placeholders of any kind:

- [Applicant Name]
- [Employer Name]
- [Country]
- [Insert Details]
- [UCI]
- [Address]
- [Date]
- [Phone Number]
- [Email]

If data is missing, write naturally without placeholders.

TONE EXAMPLE (good):

"The previous refusal noted concerns regarding my financial circumstances. To address this concern, I have included updated bank statements showing a consistent pattern of income and savings."

"My employment letter confirms my ongoing position and approved leave period. I am expected to return to my role after my visit."

TONE EXAMPLE (bad):

"The applicant's continuing professional obligations create a compelling incentive to return."

"When assessed in the context of the applicant's documented financial profile..."

CONCLUSION STYLE:

"The information provided addresses the concerns identified in the previous refusal. I respectfully request that my application be reconsidered based on the updated evidence and explanations provided."

OUTPUT: Return plain text only. No markdown. No code blocks. No JSON. No legal submission format. No attorney signature block. No "Senior Immigration Counsel". No "Immigration Barrister". No law-firm language.

DO NOT INCLUDE:

- legal essay
- legal memorandum
- immigration law lecture
- IRPA explanations
- 1500-word walls of text
- repetitive explanations
- numbered legal arguments
- "hereby" or "aforementioned"
- footnotes or citations

USE FIRST PERSON throughout.

APPLICANT INFORMATION:

Country: ${formData.country}
Visa Type: ${formData.visaType}
Purpose of Travel: ${formData.purpose}
Travel History: ${formData.travelHistory}

REFUSAL REASONS:
${formData.refusalReasons.join('\n')}

APPLICANT QUESTIONNAIRE:
${questionnaireText}
${refusalDocText}

ANALYSIS FINDINGS:
${analysisSummary}`;

  const { text: letter, model } = await generateWithFallback(prompt, {
    temperature: 0.3,
    maxOutputTokens: 8192,
  });

  console.log('APPEAL LETTER GENERATED');
  console.log(letter.slice(0, 1000));

  return letter;
}

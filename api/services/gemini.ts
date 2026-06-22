console.log('BOOT TRACE - api/services/gemini.ts loaded');
const MODEL = 'gemini-2.0-flash';

function getApiUrl(): string {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
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

  console.log('GEMINI KEY LENGTH:', rawKey.length);
  console.log('GEMINI KEY LAST CHAR CODE:', rawKey.charCodeAt(rawKey.length - 1));
  console.log('GEMINI KEY PREFIX:', rawKey.slice(0, 15));

  const trimmedKey = rawKey.trim();
  console.log('TRIMMED LENGTH:', trimmedKey.length);
  console.log('TRIMMED PREFIX:', trimmedKey.slice(0, 10));
  console.log('TRIMMED SUFFIX:', trimmedKey.slice(-5));

  const prompt = buildPrompt(formData);
  const model = MODEL;
  const requestBody = JSON.stringify({
    contents: [{
      parts: [{ text: prompt }],
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const fullUrl = `${baseUrl}?key=${trimmedKey}`;

  console.log('GEMINI MODEL:', model);
  console.log('GEMINI BASE URL:', baseUrl);
  console.log('GEMINI KEY LENGTH:', trimmedKey.length);
  console.log('GEMINI FULL URL (redacted):', fullUrl.replace(trimmedKey, '***REDACTED***'));
  console.log('GEMINI REQUEST BODY (first 500):', requestBody.slice(0, 500));

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': trimmedKey,
    },
    body: requestBody,
  });

  console.log('GEMINI RESPONSE STATUS:', response.status);
  console.log('GEMINI RESPONSE HEADERS:', JSON.stringify(Object.fromEntries(response.headers.entries())));

  if (!response.ok) {
    const err = await response.text();
    console.log('GEMINI ERROR BODY:', err.slice(0, 2000));
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const responseText = JSON.stringify(data);
  console.log('GEMINI RESPONSE BODY (first 500):', responseText.slice(0, 500));

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
  // Remove markdown code fences if present
  let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();
  // Find first { and last }
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

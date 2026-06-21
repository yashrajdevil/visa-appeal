export type VisaType = string;

export interface ExternalQuestionResponse {
  question: string;
  answer: string | boolean | string[];
}

export interface AppealFormData {
  file: File | null;
  country: string;
  visaType: string;
  purpose: string;
  travelHistory: string;
  refusalReasons: string[];
  questionnaireResponses: ExternalQuestionResponse[];
  additionalEvidence: File[];
}

export interface ConsultantVerdict {
  currentCaseStrength: 'Critical' | 'High Risk' | 'Moderate' | 'Strong';
  recommendedPath: 'Administrative Review' | 'Fresh Application' | 'Appeal';
  reasoning: string;
  confidenceLevel: 'Low' | 'Medium' | 'High';
}

export interface SuccessOutlook {
  currentReadiness: 'Low' | 'Moderate' | 'Strong';
  readinessAfterFixes: 'Low' | 'Moderate' | 'Strong';
  expectedScoreImprovement: string;
  primaryObstacles: string[];
}

export interface CaseAssessment {
  applicantName: string;
  score: number;
  severityRating: 'Critical' | 'High Risk' | 'Moderate' | 'Strong';
  caseType: string;
  consultantNotes: string[];
  consultantVerdict: ConsultantVerdict;
  successOutlook: SuccessOutlook;
}

export interface Issue {
  issue: string;
  finding: string;
  impact: 'High' | 'Medium' | 'Low' | 'Critical';
  recommendedEvidence: string[];
  recommendedAction: string;
}

export interface Strategy {
  immediateActions: string[];
  evidenceToGather: string[];
  commonMistakes: string[];
  timeline: string;
  expectedOutcome: string;
}

export interface ChecklistItem {
  item: string;
  explanation: string;
}

export interface Checklist {
  financial: ChecklistItem[];
  employment: ChecklistItem[];
  academic: ChecklistItem[];
  travel: ChecklistItem[];
  identity: ChecklistItem[];
  other: ChecklistItem[];
}

export interface GenerateAppealResponse {
  caseId?: string;
  generatedResultJson?: string;
  case_assessment: CaseAssessment;
  issues: Issue[];
  strategy: Strategy;
  checklist: Checklist;
  appeal_letter: string;
}

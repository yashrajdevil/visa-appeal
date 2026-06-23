import { GenerateAppealResponse } from './types';

// Edge-case data: confidenceLevel=85 (number), score=25, numeric stats, missing/null fields
export const edgeCaseData: GenerateAppealResponse = {
  caseId: "EDGE-CASE-001",
  case_assessment: {
    applicantName: "Test User",
    score: 25,
    severityRating: "Critical" as any,
    caseType: "Visitor Visa",
    consultantNotes: [],
    consultantVerdict: {
      currentCaseStrength: 'Critical' as any,
      recommendedPath: 'Administrative Review' as any,
      reasoning: "This case has multiple issues including a very low score. Confidence level is high that reapplication is needed with substantial changes.",
      confidenceLevel: 85 as any // This is the exact crash scenario: number instead of string
    },
    successOutlook: {
      currentReadiness: 'Low' as any,
      readinessAfterFixes: 'Strong' as any,
      expectedScoreImprovement: '+45 points',
      primaryObstacles: []
    }
  },
  issues: [
    {
      issue: "Insufficient Financial Evidence",
      finding: "The applicant failed to demonstrate adequate financial resources to cover the intended stay.",
      impact: "High" as any,
      recommendedEvidence: [
        "6 months bank statements",
        "Proof of employment income"
      ],
      recommendedAction: "Provide comprehensive financial documentation including bank statements and income proofs."
    }
  ],
  strategy: {
    immediateActions: [
      "Gather all financial documents",
      "Prepare detailed explanation letter"
    ],
    evidenceToGather: [
      "Bank statements",
      "Employment letter"
    ],
    commonMistakes: [
      "Submitting incomplete financial records",
      "Not explaining large deposits"
    ],
    timeline: "4-6 weeks",
    expectedOutcome: "Moderate improvement expected with proper documentation"
  },
  checklist: {
    financial: [
      { item: "Bank Statements (6 months)", explanation: "Showing consistent balance" },
      { item: "Pay Slips (3 months)", explanation: "Proof of stable income" }
    ],
    employment: [
      { item: "Employment Contract", explanation: "Confirming job position and salary" }
    ],
    academic: [],
    travel: [],
    identity: [
      { item: "Valid Passport", explanation: "Must be valid beyond travel date" }
    ],
    other: []
  },
  appeal_letter: `RE: Temporary Resident Visa Reapplication Submission

This submission addresses the concerns identified in the previous refusal decision regarding travel history and the applicant's incentives to depart Canada at the conclusion of the authorized stay.

Refusal Ground 1: Limited Travel History

The previous decision noted that the applicant's travel history was insufficient to establish a pattern of international compliance.

While the applicant's international travel history is limited, travel history should be assessed alongside the applicant's overall circumstances rather than in isolation. The applicant is a full-time marketing professional with established employment, ongoing financial commitments, and documented obligations requiring continued residence in the Philippines.

The applicant's lack of extensive prior travel is attributable to professional and financial priorities during the early stages of career development rather than any unwillingness or inability to comply with immigration requirements.

Supporting documentation included with this submission demonstrates stable employment, sustained income, and a consistent residential and financial profile.

Refusal Ground 2: Incentives to Return to the Philippines

The applicant has provided substantial evidence demonstrating significant economic and professional ties to the Philippines.

Employment documentation confirms permanent full-time employment and identifies the applicant's involvement in a scheduled national marketing campaign commencing immediately following the proposed return date. The applicant's continued participation is contractually and professionally required.

Financial documentation demonstrates an established banking history, ongoing income generation, and accumulated savings developed over an extended period. The travel expenses associated with the proposed visit represent a reasonable expenditure relative to the applicant's financial circumstances.

Additional supporting evidence further confirms the applicant's ongoing commitments within the Philippines and reinforces the temporary nature of the proposed visit.

Overall Assessment

The updated submission directly addresses the concerns identified in the refusal decision through objective documentary evidence.

The applicant has demonstrated:

• Sufficient financial capacity to undertake the proposed visit

• Stable employment and professional obligations requiring return

• Established economic ties within the Philippines

• A credible and temporary travel purpose

• Strong incentives to comply with all immigration conditions

The applicant respectfully requests that the application be reassessed in light of the additional evidence now provided.

Submitted in support of the Temporary Resident Visa reapplication.`
};

export const sampleReportData: GenerateAppealResponse = {
  caseId: "TRV-9901-CAN",
  case_assessment: {
    applicantName: "J. Dela Cruz",
    score: 58,
    severityRating: "High Risk",
    caseType: "Temporary Resident Visa (Canada)",
    consultantNotes: [
      "The officer is not satisfied that you will leave Canada at the end of your stay, as stipulated in subsection 200(1) of the IRPR, based on your travel history.",
      "The officer views a long-haul, high-cost trip to a Tier 1 nation as a first major international travel experience as a break from standard normative travel behavior.",
      "Without previous exit stamps from countries with strict immigration controls, there is no empirical evidence of visa compliance.",
      "The financial demonstration of $8,000 CAD covers capacity but the economic imbalance confirms to the officer that this is not a casual vacation."
    ],
    consultantVerdict: {
      currentCaseStrength: 'High Risk',
      recommendedPath: 'Fresh Application',
      reasoning: "A rapid reapplication is not recommended for a pure travel history refusal unless a critical piece of evidence was accidentally omitted or the trip is deeply time-sensitive. We strongly advise the 'Delay & Build Strategy' to acquire travel history by applying for a visa to a moderate-tier country first, OR dramatically strengthening your employment and financial ties.",
      confidenceLevel: "Medium"
    },
    successOutlook: {
      currentReadiness: "Low",
      readinessAfterFixes: "Strong",
      expectedScoreImprovement: "+28 points",
      primaryObstacles: [
        "Overcoming the lack of Tier 1 travel history",
        "Justifying the disproportionate cost of the trip against liquid savings",
        "Proving employment indispensability in the home country"
      ]
    }
  },
  issues: [
    {
      issue: "Travel History & Normative Behavior",
      finding: "Attempting a first-time major trip to Canada bypassing closer, more affordable tourist destinations creates a negative risk profile according to IRCC predictive modeling.",
      impact: "Critical",
      recommendedEvidence: [
        "Passport stamps from intermediate destinations (Japan, South Korea, etc.)",
        "Detailed Statement of Purpose (SOP) explaining the explicit reason for choosing Canada now"
      ],
      recommendedAction: "Acknowledge the lack of travel history directly in an SOP. Explain logically why Canada is the chosen destination now (e.g. deferred travel due to the pandemic, or visiting a specific close friend/relative)."
    },
    {
      issue: "Employment Anchoring",
      finding: "A standard Certificate of Employment proves you have a job, but fails to prove you absolutely must return to it. It lacks the gravity to overcome the travel deficit.",
      impact: "High",
      recommendedEvidence: [
        "Affidavit from a direct manager detailing your critical role",
        "Evidence of an upcoming, specific project commencing immediately after your planned return",
        "Approved, strictly dated leave of absence letter"
      ],
      recommendedAction: "Weaponize your employment documents. Provide an affidavit from leadership demonstrating your indispensability to a specific upcoming business deliverable."
    },
    {
      issue: "Financial Disproportion",
      finding: "While $8,000 CAD demonstrates capacity, spending a large portion of your accessible liquid savings on a single vacation raises serious concerns regarding genuine intent.",
      impact: "Medium",
      recommendedEvidence: [
        "Proof of long-term illiquid assets in home country (real estate, vehicles)",
        "Evidence of active business registrations or ongoing investments",
        "Historical bank statements showing a long-term buildup of funds, not just a recent injection"
      ],
      recommendedAction: "Shift the focus from liquid cash to long-term financial stability in the Philippines. Demonstrate assets that would be catastrophic to abandon."
    }
  ],
  strategy: {
    immediateActions: [
      "Draft a highly targeted Statement of Purpose addressing the lack of travel history honestly.",
      "Request a customized, detailed employment affidavit from your employer rather than a generic HR letter.",
      "Consolidate documentation proving long-term assets, investments, and ties to the Philippines."
    ],
    evidenceToGather: [
      "Managerial Affidavit of Indispensability",
      "Deeds for property or vehicle registrations",
      "6 months of historical bank statements",
      "Detailed, non-generic day-by-day travel itinerary in Canada"
    ],
    commonMistakes: [
      "Submitting the exact same application without changing the narrative.",
      "Providing an overly generic 'Certificate of Employment'.",
      "Ignoring the travel history refusal and hoping a different officer will approve it."
    ],
    timeline: "3-6 months. We recommend traveling to 1-2 accessible countries (e.g. Japan, Singapore) to establish travel history first before reapplying.",
    expectedOutcome: "With the recommended evidence and established travel history, approval odds increase dramatically on a fresh application."
  },
  checklist: {
    financial: [
      { item: "6-Month Historical Bank Statements", explanation: "Shows consistent financial history and avoids the appearance of recent 'funds parking'." },
      { item: "Proof of Illiquid Assets (e.g. Property/Car)", explanation: "Demonstrates long-term economic ties to your home country." }
    ],
    employment: [
      { item: "Managerial Affidavit of Employment", explanation: "Must detail your critical role in an upcoming project ensuring your return." },
      { item: "Recent Pay Stubs & Income Tax Return (ITR)", explanation: "Corroborates the employment letter and salary." }
    ],
    academic: [],
    travel: [
      { item: "Detailed Day-by-Day Itinerary", explanation: "A clear, well-researched plan of your stay to justify the destination choice." },
      { item: "Previous Entry/Exit Stamps (If acquired)", explanation: "Critical for overcoming the primary refusal reason." }
    ],
    identity: [
      { item: "Valid Passport", explanation: "Must be valid for at least 6 months beyond intended stay." }
    ],
    other: [
      { item: "Comprehensive Statement of Purpose (SOP)", explanation: "The core document addressing the travel history gap directly." }
    ]
  },
  appeal_letter: `RE: Temporary Resident Visa Reapplication Submission

This submission addresses the concerns identified in the previous refusal decision regarding travel history and the applicant's incentives to depart Canada at the conclusion of the authorized stay.

Refusal Ground 1: Limited Travel History

The previous decision noted that the applicant's travel history was insufficient to establish a pattern of international compliance.

While the applicant's international travel history is limited, travel history should be assessed alongside the applicant's overall circumstances rather than in isolation. The applicant is a full-time marketing professional with established employment, ongoing financial commitments, and documented obligations requiring continued residence in the Philippines.

The applicant's lack of extensive prior travel is attributable to professional and financial priorities during the early stages of career development rather than any unwillingness or inability to comply with immigration requirements.

Supporting documentation included with this submission demonstrates stable employment, sustained income, and a consistent residential and financial profile.

Refusal Ground 2: Incentives to Return to the Philippines

The applicant has provided substantial evidence demonstrating significant economic and professional ties to the Philippines.

Employment documentation confirms permanent full-time employment and identifies the applicant's involvement in a scheduled national marketing campaign commencing immediately following the proposed return date. The applicant's continued participation is contractually and professionally required.

Financial documentation demonstrates an established banking history, ongoing income generation, and accumulated savings developed over an extended period. The travel expenses associated with the proposed visit represent a reasonable expenditure relative to the applicant's financial circumstances.

Additional supporting evidence further confirms the applicant's ongoing commitments within the Philippines and reinforces the temporary nature of the proposed visit.

Overall Assessment

The updated submission directly addresses the concerns identified in the refusal decision through objective documentary evidence.

The applicant has demonstrated:

• Sufficient financial capacity to undertake the proposed visit

• Stable employment and professional obligations requiring return

• Established economic ties within the Philippines

• A credible and temporary travel purpose

• Strong incentives to comply with all immigration conditions

The applicant respectfully requests that the application be reassessed in light of the additional evidence now provided.

Submitted in support of the Temporary Resident Visa reapplication.`
};

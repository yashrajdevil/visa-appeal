const fs = require('fs');

const updateFile = (filePath) => {
  let file = fs.readFileSync(filePath, 'utf8');

  const replacements = [
    [/Appeal Package/g, 'Reapplication Preparation Package'],
    [/Visa Appeal Package/gi, 'Visa Reapplication Package'],
    [/Visa Appeal Builder/g, 'Visa Reapplication Planning Platform'],
    [/VisaAppeal Builder/g, 'Visa Reapplication Platform'],
    [/Visa Appeal AI/g, 'Application Readiness Platform'],
    [/Appeal Potential Score/gi, 'Application Readiness Score'],
    [/Appeal Potential/gi, 'Application Readiness Score'],
    [/Consultant Verdict/g, 'AI Assessment Summary'],
    [/Appeal Letter Draft/g, 'Supporting Explanation Draft'],
    [/Success Outlook/g, 'Readiness Outlook'],
    [/Appeal Score/g, 'Case Readiness Score'],
    [/Appeal Strategy/g, 'Reapplication Strategy'],
    [/Appeal Analysis/g, 'Refusal Analysis'],
    [/Appeal Recommendations?/g, 'Recommended Next Step'],
    [/Draft Legal Submission \(Appeal Letter\)/g, 'Draft Preparation Submission (Supporting Explanation)'],
    [/copy the appeal letter/gi, 'copy the supporting explanation'],
    [/formal_appeal_draft/g, 'formal_supporting_explanation_draft'],
    [/Appeal Letter \+/gi, 'Document Draft +'],
    [/legal advice/gi, 'immigration advice'],
    [/legal representation/gi, 'representation'],
  ];

  for (const [regex, replacement] of replacements) {
    file = file.replace(regex, replacement);
  }

  fs.writeFileSync(filePath, file);
};

updateFile('src/components/ResultsDashboard.tsx');
updateFile('src/components/LandingView.tsx');
updateFile('src/components/CaseWizard.tsx');
updateFile('src/components/Footer.tsx');
updateFile('src/components/WhyChooseUsView.tsx');
updateFile('src/components/AboutUsView.tsx');
updateFile('src/components/RefundView.tsx');
updateFile('src/components/PrivacyPolicyView.tsx');
updateFile('src/components/blog/BlogHubView.tsx');
updateFile('src/components/blog/BlogArticleView.tsx');

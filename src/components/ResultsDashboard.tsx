import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Copy, CheckCircle2, ChevronLeft, FileText, CheckSquare, Clock, Briefcase, AlertCircle, Lock, ShoppingCart, Loader2, Zap, Shield, Crown, X } from 'lucide-react';
import { GenerateAppealResponse, ChecklistItem } from '../types';
import SEO from './SEO';

interface ResultsDashboardProps {
  result: GenerateAppealResponse;
  onReset: () => void;
  purchasedPlan?: string;
  isSample?: boolean;
  onPurchase?: (plan: 'starter' | 'standard' | 'premium') => void;
  isPurchasing?: boolean;
}

const PLAN_TIERS = ['starter', 'standard', 'premium'] as const;

function hasAccess(purchasedPlan: string | undefined, requiredTier: string): boolean {
  if (!purchasedPlan) return false;
  return PLAN_TIERS.indexOf(purchasedPlan as any) >= PLAN_TIERS.indexOf(requiredTier as any);
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$9.99', icon: Zap, color: 'indigo' },
  { id: 'standard', name: 'Standard', price: '$19.99', icon: Shield, color: 'indigo', recommended: true },
  { id: 'premium', name: 'Premium', price: '$34.99', icon: Crown, color: 'purple' },
];

const FEATURES = [
  { key: 'appeal_letter', label: 'Explanation Letter Draft', starter: true, standard: true, premium: true },
  { key: 'basic_checklist', label: 'Basic Document Checklist', starter: true, standard: true, premium: true },
  { key: 'pdf_export', label: 'PDF Export', starter: true, standard: true, premium: true },
  { key: 'readiness_score', label: 'Application Readiness Score', starter: false, standard: true, premium: true },
  { key: 'strategy', label: 'Reapplication Strategy Planner', starter: false, standard: true, premium: true },
  { key: 'categorized_checklist', label: 'Categorized Document Checklist', starter: false, standard: true, premium: true },
  { key: 'refusal_analysis', label: 'Detailed Refusal Analysis', starter: false, standard: false, premium: true },
  { key: 'executive_summary', label: 'Executive Summary & Assessment', starter: false, standard: false, premium: true },
];

type FeatureKey = typeof FEATURES[number]['key'];

const FEATURE_PLAN: Record<FeatureKey, 'starter' | 'standard' | 'premium'> = {
  appeal_letter: 'starter',
  basic_checklist: 'starter',
  pdf_export: 'starter',
  readiness_score: 'standard',
  strategy: 'standard',
  categorized_checklist: 'standard',
  refusal_analysis: 'premium',
  executive_summary: 'premium',
};

function getRequiredPlanLabel(featureKey: FeatureKey): string {
  const plan = FEATURE_PLAN[featureKey];
  if (plan === 'starter') return 'Requires Starter Plan';
  if (plan === 'standard') return 'Requires Standard Plan';
  return 'Requires Premium Plan';
}

function PlanCard({ plan, onPurchase, isPurchasing }: { plan: typeof PLANS[0]; onPurchase: (plan: 'starter' | 'standard' | 'premium') => void; isPurchasing?: boolean }) {
  const isPurple = plan.color === 'purple';
  const Icon = plan.icon;
  return (
    <div className={`bg-zinc-900 border rounded-2xl p-6 flex flex-col ${plan.recommended ? `border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.15)]` : 'border-zinc-800'}`}>
      {plan.recommended && (
        <div className="text-center -mt-10 mb-4">
          <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded-full">Most Popular</span>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isPurple ? 'bg-purple-500/10' : 'bg-indigo-500/10'}`}>
          <Icon className={`w-5 h-5 ${isPurple ? 'text-purple-400' : 'text-indigo-400'}`} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
          <div className="text-3xl font-bold text-white">{plan.price}</div>
        </div>
      </div>
      <div className="flex-1 space-y-2 mb-6">
        {FEATURES.map((f) => {
          const included = f[plan.id as keyof typeof f];
          return (
            <div key={f.key} className={`flex items-center gap-2 text-sm ${included ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {included ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-zinc-700 flex-shrink-0" />
              )}
              {f.label}
            </div>
          );
        })}
      </div>
      <button
        onClick={() => onPurchase(plan.id as 'starter' | 'standard' | 'premium')}
        disabled={isPurchasing}
        className={`w-full py-3 rounded-full ${isPurple ? 'bg-purple-600 hover:bg-purple-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2`}
      >
        {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
        {isPurchasing ? 'Redirecting...' : `Choose ${plan.name}`}
      </button>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const p = PLANS.find(x => x.id === plan);
  if (!p) return null;
  const colors: Record<string, string> = { starter: 'bg-zinc-700 text-zinc-300', standard: 'bg-indigo-500/20 text-indigo-300', premium: 'bg-purple-500/20 text-purple-300' };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${colors[plan] || colors.starter}`}>{p.name}</span>;
}

function LockOverlay({ featureKey, onPurchase }: { featureKey: FeatureKey; onPurchase?: (plan: 'starter' | 'standard' | 'premium') => void }) {
  const plan = FEATURE_PLAN[featureKey];
  const feature = FEATURES.find(f => f.key === featureKey);
  const p = PLANS.find(x => x.id === plan);
  return (
    <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
      <Lock className="w-6 h-6 text-amber-400 mb-2" />
      <p className="text-sm text-zinc-300 font-medium mb-1">{feature?.label || featureKey}</p>
      <p className="text-xs text-zinc-500 mb-4">{getRequiredPlanLabel(featureKey)}</p>
      {onPurchase && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPurchase(plan); }}
          className="text-sm px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full transition-colors shadow-lg"
        >
          Unlock {p?.name || plan} ({p?.price})
        </button>
      )}
    </div>
  );
}

function PricingTable({ onPurchase }: { onPurchase?: (plan: 'starter' | 'standard' | 'premium') => void }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-4 px-6 text-zinc-400 font-medium">Feature</th>
              {PLANS.map(p => (
                <th key={p.id} className={`text-center py-4 px-4 ${p.recommended ? 'bg-indigo-500/5' : ''}`}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <p.icon className={`w-4 h-4 ${p.color === 'purple' ? 'text-purple-400' : 'text-indigo-400'}`} />
                    <span className="text-white font-semibold">{p.name}</span>
                  </div>
                  <div className="text-lg font-bold text-white">{p.price}</div>
                  {p.recommended && <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mt-1">Recommended</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f.key} className="border-b border-zinc-800/50">
                <td className="py-3.5 px-6 text-zinc-300">{f.label}</td>
                {PLANS.map(p => {
                  const included = f[p.id as keyof typeof f];
                  return (
                    <td key={p.id} className={`text-center py-3.5 px-4 ${p.recommended ? 'bg-indigo-500/5' : ''}`}>
                      {included ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-zinc-700 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 border-t border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => onPurchase?.(p.id as 'starter' | 'standard' | 'premium')}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                p.recommended ? 'bg-indigo-600 text-white hover:bg-indigo-500' :
                p.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-500' :
                'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Choose {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResultsDashboard({ result, onReset, purchasedPlan, isSample = false, onPurchase, isPurchasing }: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);
  const isPreview = !purchasedPlan && !isSample;
  const isStarter = hasAccess(purchasedPlan, 'starter');
  const isStandard = hasAccess(purchasedPlan, 'standard');
  const isPremium = hasAccess(purchasedPlan, 'premium');

  const hasFeature = (key: FeatureKey): boolean => {
    if (isSample) return true;
    if (isPreview) return false;
    return hasAccess(purchasedPlan, FEATURE_PLAN[key]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.appeal_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (isPreview && onPurchase) {
      onPurchase('starter');
      return;
    }
    if (!hasFeature('pdf_export')) {
      onPurchase?.('starter');
      return;
    }

    setPdfLoading(true);
    console.log('[PDF] Starting PDF generation...');

    if (!pdfWrapperRef.current) {
      console.error('[PDF] pdfWrapperRef not found');
      setPdfLoading(false);
      return;
    }

    const wrapper = pdfWrapperRef.current;
    const content = pdfContentRef.current;
    if (!content) {
      console.error('[PDF] pdfContentRef not found');
      setPdfLoading(false);
      return;
    }

    try {
      wrapper.style.display = 'block';
      content.style.display = 'block';
      console.log('[PDF] Hidden wrapper revealed for capture');

      await new Promise(r => setTimeout(r, 300));

      console.log('[PDF] Importing html2canvas and jspdf...');
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      console.log('[PDF] Libraries loaded successfully');

      console.log('[PDF] Capturing content with html2canvas...');
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: content.scrollWidth,
        height: content.scrollHeight,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
      });
      console.log('[PDF] Canvas captured, dimensions:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ unit: 'in', format: 'a4', orientation: 'portrait' });

      const pdfWidth = 8.27;
      const pdfHeight = 11.69;
      const margin = 0.4;
      const usableWidth = pdfWidth - 2 * margin;
      const usableHeight = pdfHeight - 2 * margin;
      const imgToPdfRatio = usableWidth / canvas.width;
      const pageCanvasHeight = usableHeight / imgToPdfRatio;

      console.log('[PDF] Page dimensions - usable:', usableWidth, 'x', usableHeight, 'pageCanvasHeight:', pageCanvasHeight, 'imgToPdfRatio:', imgToPdfRatio);

      let remainingHeight = canvas.height;
      let srcY = 0;
      let pageNum = 1;

      while (remainingHeight > 0) {
        if (pageNum > 1) pdf.addPage();

        const sliceHeight = Math.min(remainingHeight, pageCanvasHeight);
        console.log(`[PDF] Page ${pageNum}: srcY=${srcY}, sliceHeight=${sliceHeight}, remaining=${remainingHeight}`);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sliceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.95);

        pdf.addImage(pageImgData, 'JPEG', margin, margin, usableWidth, sliceHeight * imgToPdfRatio);

        srcY += sliceHeight;
        remainingHeight -= sliceHeight;
        pageNum++;
      }

      console.log('[PDF] Total pages:', pageNum - 1);
      pdf.save('Visa_Appeal_Package.pdf');
      console.log('[PDF] Download triggered successfully');
    } catch (err: any) {
      console.error('[PDF] Generation failed:', err.message);
      console.error('[PDF] Stack:', err.stack);
      alert('An error occurred while generating the PDF. Please try again or use the Copy button to save your content in the meantime.');
    } finally {
      wrapper.style.display = 'none';
      if (content) content.style.display = 'none';
      setPdfLoading(false);
      console.log('[PDF] Generation complete, hidden wrapper restored');
    }
  };

  const scoreColor =
    result.case_assessment.severityRating === 'Strong' ? 'text-emerald-400' :
    result.case_assessment.severityRating === 'Moderate' ? 'text-blue-400' :
    result.case_assessment.severityRating === 'High Risk' ? 'text-amber-400' : 'text-rose-400';

  const severityBadgeColor =
    result.case_assessment.severityRating === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
    result.case_assessment.severityRating === 'High Risk' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
    result.case_assessment.severityRating === 'Moderate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  const renderChecklistSection = (title: string, items: ChecklistItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8">
        <h4 className="text-sm text-zinc-400 uppercase tracking-widest font-semibold mb-4 ml-1">{title}</h4>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-4 border-b border-zinc-800/80 group">
              <div className="mt-0.5 w-5 h-5 flex-shrink-0 border-2 border-zinc-700 rounded bg-zinc-900 group-hover:border-zinc-500 transition-colors" />
              <div>
                <span className="text-base text-zinc-200 block mb-1 font-medium">{item.item}</span>
                <span className="text-sm text-zinc-400 block">{item.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="Appeal Results | Visa Reapplication Planning Platform" description="" noindex={true} />
      <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full relative z-10 flex flex-col">
      <div className="flex items-start sm:items-center justify-between mb-12 flex-col sm:flex-row gap-6">
        <div>
          <button
            onClick={onReset}
            className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> {isSample ? 'Back to Previous' : 'Start New Analysis'}
          </button>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-2">Reapplication Preparation Package</h2>
          {isPreview && (
            <p className="text-amber-400 flex items-center gap-1.5"><Lock className="w-4 h-4" /> Preview Mode — Unlock for full access to all sections</p>
          )}
          {!isPreview && !isSample && (
            <p className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> <span className="capitalize">{purchasedPlan}</span> Package Unlocked</p>
          )}
        </div>

        <div className="flex z-20 items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none items-center justify-center flex gap-1.5 px-4 py-2 text-sm font-medium bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
            disabled={!hasFeature('appeal_letter')}
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Letter'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="flex-1 sm:flex-none items-center justify-center flex gap-1.5 px-6 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50"
          >
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {pdfLoading ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {/* SECTION 1 — CASE ASSESSMENT */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Case Assessment</h3>
            {!isSample && purchasedPlan && <PlanBadge plan={purchasedPlan} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score & Severity */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-start shadow-lg overflow-hidden relative">
              {!hasFeature('readiness_score') && (
                <LockOverlay featureKey="readiness_score" onPurchase={onPurchase} />
              )}
              <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2 font-medium">Application Readiness Score</div>
              <div className={`text-5xl font-bold ${scoreColor} mb-4`}>
                {result.case_assessment.score}<span className="text-2xl text-zinc-600 font-medium">/100</span>
              </div>

              <div className="w-full pt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Severity Rating</div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${severityBadgeColor}`}>
                  {result.case_assessment.severityRating}
                </div>
              </div>
              <div className="w-full pt-4 mt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Case Type</div>
                <div className="text-sm text-zinc-300 font-medium">{result.case_assessment.caseType}</div>
              </div>
              <div className="w-full pt-4 mt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Applicant</div>
                <div className="text-sm text-zinc-300 font-medium">{result.case_assessment.applicantName || 'Confidential Client'}</div>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Executive Summary / Verdict */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Briefcase className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-zinc-200">Consultant Assessment</h4>
                  {!isSample && purchasedPlan && <PlanBadge plan={purchasedPlan} />}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-zinc-800/80 relative z-10">
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Current Case Strength</div>
                    <div className="text-lg text-white font-medium mb-1">
                      {result.case_assessment.consultantVerdict.currentCaseStrength}
                    </div>
                    <div className="text-xs text-zinc-400">Confidence: <span className="text-emerald-400">{result.case_assessment.consultantVerdict.confidenceLevel}</span></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Recommended Path</div>
                    <div className="text-lg text-indigo-400 font-medium">{result.case_assessment.consultantVerdict.recommendedPath}</div>
                  </div>
                </div>

                <div className="mb-6 relative z-10 overflow-hidden">
                  {!hasFeature('executive_summary') && (
                    <LockOverlay featureKey="executive_summary" onPurchase={onPurchase} />
                  )}
                  <div className={`transition-opacity ${!hasFeature('executive_summary') ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Consultant Reasoning:</div>
                    </div>
                    <p className="text-sm text-zinc-300 italic mb-6">
                       "{result.case_assessment.consultantVerdict.reasoning}"
                    </p>

                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Consultant Notes</h4>
                    <ul className="space-y-3 mb-6">
                        {result.case_assessment.consultantNotes.map((note, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                            <span className="leading-relaxed">{note}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {result.case_assessment.successOutlook && (
                  <div className="pt-6 border-t border-zinc-800/80 relative z-10 overflow-hidden">
                    {!hasFeature('readiness_score') && (
                      <LockOverlay featureKey="readiness_score" onPurchase={onPurchase} />
                    )}
                    <div className={`transition-opacity ${!hasFeature('readiness_score') ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                      <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-semibold">Readiness Outlook</h4>
                      <div className="flex flex-col sm:flex-row gap-6">
                         <div className="flex-1">
                           <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Current Readiness</div>
                           <div className="text-white font-medium">{result.case_assessment.successOutlook.currentReadiness}</div>
                         </div>
                         <div className="flex-1">
                           <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Post-Fixes Outlook</div>
                           <div className="text-emerald-400 font-medium">{result.case_assessment.successOutlook.readinessAfterFixes}</div>
                         </div>
                         <div className="flex-1">
                           <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Exp. Improvement</div>
                           <div className="text-indigo-400 font-medium">{result.case_assessment.successOutlook.expectedScoreImprovement}</div>
                         </div>
                      </div>
                      {result.case_assessment.successOutlook.primaryObstacles && result.case_assessment.successOutlook.primaryObstacles.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Primary Obstacles to Address</div>
                          <div className="flex flex-wrap gap-2">
                            {result.case_assessment.successOutlook.primaryObstacles.map((obs, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20">{obs}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* REFUSAL ISSUE BREAKDOWN */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Refusal Issue Breakdown</h3>
            {!isSample && purchasedPlan && <PlanBadge plan={purchasedPlan} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.issues.map((issue, idx) => (
              <div key={idx} className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-semibold text-white">{issue.issue}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    issue.impact === 'Critical' || issue.impact === 'High' ? 'bg-rose-500/10 text-rose-400' :
                    issue.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {issue.impact} Impact
                  </span>
                </div>

                <div className="relative mt-4">
                  {!hasFeature('refusal_analysis') && (
                    <LockOverlay featureKey="refusal_analysis" onPurchase={onPurchase} />
                  )}
                  <div className={`transition-opacity ${!hasFeature('refusal_analysis') ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                    <div className="mb-4 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Finding</div>
                      <div className="text-sm text-zinc-300">{issue.finding}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Recommended Action</div>
                      <div className="text-sm text-indigo-300 font-medium">{issue.recommendedAction}</div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Required Evidence</div>
                      <ul className="space-y-1.5">
                        {issue.recommendedEvidence.map((ev, i) => (
                          <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPLANATION LETTER DRAFT */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Supporting Explanation Draft</h3>
            {!isSample && purchasedPlan && <PlanBadge plan={purchasedPlan} />}
          </div>

          <div className="relative">
             <div className="bg-zinc-800/30 -mx-4 sm:-mx-8 p-4 sm:p-8 rounded-3xl border border-zinc-800/50 shadow-inner overflow-x-auto flex flex-col items-center pb-24">

              {/* Viewer Header Toolbar */}
              <div className="mb-4 w-full max-w-[800px] flex justify-between items-center bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-700/50 shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-md">
                       <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-200 tracking-wide">formal_supporting_explanation_draft.docx</span>
                 </div>
                 <div className="flex gap-1.5 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                 </div>
              </div>

              {/* A4 Document Canvas */}
              <div
                className="relative bg-white shrink-0 shadow-2xl rounded-sm py-16 px-10 sm:py-24 sm:px-16"
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  minHeight: '1050px'
                }}
              >
                <div className="max-w-[650px] mx-auto w-full relative z-10 text-black">
                   <div className="whitespace-pre-wrap font-serif text-[15px] leading-[1.8] text-[#1a1a1a] tracking-normal text-justify">
                     {hasFeature('appeal_letter') || isSample ? (
                       <div className="outline-none focus:ring-2 ring-indigo-500/20 rounded-md p-2 -m-2 transition-all" contentEditable suppressContentEditableWarning>
                          {result.appeal_letter}
                       </div>
                     ) : (
                       <>
                         <div>{result.appeal_letter.slice(0, 300)}...</div>
                         <div className="mt-4 blur-[4px] opacity-40 select-none">
                           {result.appeal_letter.slice(300, 1500)}
                           <br/><br/>
                           [Letter continues securely...]
                         </div>
                       </>
                     )}
                   </div>
                </div>

                {/* Paywall Overlay */}
                {isPreview && (
                  <div className="absolute inset-x-0 bottom-0 top-[200px] z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-[4px]">
                    <div className="w-full max-w-md bg-zinc-950 p-8 rounded-3xl shadow-2xl border border-zinc-800 mt-32 text-left">
                      <div className="text-center mb-8">
                         <Lock className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                         <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Unlock Application Package</h3>
                         <p className="text-sm text-zinc-400">Choose a plan to generate your full appeal package.</p>
                      </div>

                      <div className="space-y-3">
                        {PLANS.map((plan) => (
                          <div
                            key={plan.id}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer relative ${
                              plan.recommended ? 'border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/20' :
                              plan.color === 'purple' ? 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10' :
                              'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80'
                            }`}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPurchase?.(plan.id as 'starter' | 'standard' | 'premium'); }}
                          >
                            {plan.recommended && (
                              <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-indigo-500 text-white text-[9px] uppercase font-bold tracking-wider rounded-sm">Recommended</div>
                            )}
                            <div className="flex items-center gap-3">
                              <plan.icon className={`w-5 h-5 ${plan.color === 'purple' ? 'text-purple-400' : 'text-indigo-400'}`} />
                              <div>
                                <div className="font-semibold text-white">{plan.name}</div>
                                <div className="text-xs text-zinc-400">{plan.price}</div>
                              </div>
                            </div>
                            <button className="text-xs px-4 py-1.5 bg-white text-zinc-950 font-semibold uppercase tracking-wide rounded-full">Unlock</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
             </div>
          </div>
        </section>

        {/* REAPPLICATION STRATEGY */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Reapplication Strategy Planner</h3>
            {!isSample && purchasedPlan && <PlanBadge plan={purchasedPlan} />}
          </div>
          <div className="relative">
            {!hasFeature('strategy') && (
              <LockOverlay featureKey="strategy" onPurchase={onPurchase} />
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!hasFeature('strategy') ? 'blur-sm opacity-40 select-none' : ''}`}>
             <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">Immediate Actions</h4>
                <ul className="space-y-3">
                  {result.strategy.immediateActions.map((action, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">Evidence To Gather</h4>
                <ul className="space-y-3">
                  {result.strategy.evidenceToGather.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">Common Mistakes To Avoid</h4>
                <ul className="space-y-3">
                  {result.strategy.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-zinc-800/20 border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-center text-center">
                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Recommended Timeline</h4>
                <div className="text-lg font-medium text-white mb-4">{result.strategy.timeline}</div>

                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold pt-4 border-t border-zinc-800">Expected Outcome</h4>
                <div className="text-sm text-emerald-400 font-medium">{result.strategy.expectedOutcome}</div>
             </div>
          </div>
          </div>
        </section>

         {/* DOCUMENT CHECKLIST */}
        <section className="pb-16 border-t border-zinc-800/80 pt-12">
          <div className="flex items-center gap-2 mb-8">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Document Checklist</h3>
            {!isSample && purchasedPlan && <PlanBadge plan={purchasedPlan} />}
          </div>

          {/* Basic checklist — always visible with Starter+ */}
          <div className="max-w-3xl relative z-10">
            <div className={`relative ${!hasFeature('basic_checklist') && !hasFeature('categorized_checklist') ? '' : ''}`}>
              {renderChecklistSection('Identity Documents', result.checklist.identity)}
              {renderChecklistSection('Travel Documents', result.checklist.travel)}

              {/* Categorized checklist — Standard+ */}
              {hasFeature('categorized_checklist') || isSample ? (
                <div className="relative mt-8">
                  {renderChecklistSection('Financial Documents', result.checklist.financial)}
                  {renderChecklistSection('Employment Documents', result.checklist.employment)}
                  {renderChecklistSection('Academic Documents', result.checklist.academic)}
                  {renderChecklistSection('Other Documents', result.checklist.other)}
                </div>
              ) : !isPreview ? (
                <div className="relative mt-8">
                  <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center border border-zinc-800 rounded-xl">
                     <Lock className="w-6 h-6 text-indigo-400 mb-3" />
                     <h4 className="text-lg font-bold text-white mb-1">Categorized Checklist Locked</h4>
                     <p className="text-sm text-zinc-400 mb-1">Requires Standard Plan</p>
                     <button
                       type="button"
                       onClick={(e) => { e.preventDefault(); onPurchase?.('standard'); }}
                       className="text-sm px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full transition-colors shadow-lg"
                     >
                       Unlock Standard ($19.99)
                     </button>
                  </div>
                  <div className="opacity-30 blur-sm pointer-events-none">
                    {renderChecklistSection('Financial Documents', result.checklist.financial)}
                    {renderChecklistSection('Employment Documents', result.checklist.employment)}
                    {renderChecklistSection('Academic Documents', result.checklist.academic)}
                    {renderChecklistSection('Other Documents', result.checklist.other)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* Pricing Comparison Table */}
      {isPreview && onPurchase && (
        <div className="mt-16 pt-12 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
          </div>
          <p className="text-zinc-400 mb-8">
            Your analysis is ready. Select a plan to unlock your full reapplication preparation package.
          </p>
          <PricingTable onPurchase={onPurchase} />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-500">
          <strong>Disclaimer:</strong> This platform provides document preparation and informational assistance only. It does not provide immigration advice, legal advice, or representation before any government authority.
        </div>
      </div>

      {/* Hidden PDF Content — plan-conditional pages */}
      <div ref={pdfWrapperRef} style={{ display: 'none', position: 'absolute', left: '-9999px', top: 0, width: '800px', zIndex: -1 }}>
        <div ref={pdfContentRef} className="bg-white text-black" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", width: '800px' }}>

          {/* PAGE 1 — COVER (always included) */}
          <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '1100px' }}>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ borderBottom: '4px solid #1a1a2e', paddingBottom: '20px', marginBottom: '30px' }}>
                 <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px', color: '#1a1a2e' }}>Visa Reapplication Preparation Package</h1>
                 <p style={{ fontSize: '18px', color: '#555', margin: '0', fontWeight: '500' }}>Professional Consultant Case Assessment &amp; Submission Document</p>
               </div>

               <div style={{ backgroundColor: '#f0f4ff', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #dbe4ff' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                   <div>
                     <div style={{ fontSize: '13px', textTransform: 'uppercase', color: '#3b3b5c', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>Application Readiness Score</div>
                     <div style={{ fontSize: '48px', fontWeight: '800', color: result.case_assessment.score > 79 ? '#059669' : result.case_assessment.score > 59 ? '#2563eb' : result.case_assessment.score > 39 ? '#d97706' : '#dc2626', lineHeight: '1' }}>{result.case_assessment.score}<span style={{ fontSize: '22px', color: '#888' }}>/100</span></div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '13px', textTransform: 'uppercase', color: '#3b3b5c', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>Severity Rating</div>
                     <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>{result.case_assessment.severityRating}</div>
                   </div>
                 </div>
                 <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                   <div style={{ width: `${result.case_assessment.score}%`, backgroundColor: result.case_assessment.score > 79 ? '#059669' : result.case_assessment.score > 59 ? '#2563eb' : result.case_assessment.score > 39 ? '#d97706' : '#dc2626', height: '100%', borderRadius: '4px' }}></div>
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                 <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>Applicant</div>
                   <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>{result.case_assessment.applicantName || 'Confidential Client'}</div>
                 </div>
                 <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>Visa Type</div>
                   <div style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>{result.case_assessment.caseType}</div>
                 </div>
                 <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>Case Strength</div>
                   <div style={{ fontSize: '18px', fontWeight: '700', color: result.case_assessment.score > 79 ? '#059669' : result.case_assessment.score > 59 ? '#2563eb' : result.case_assessment.score > 39 ? '#d97706' : '#dc2626' }}>{result.case_assessment.consultantVerdict.currentCaseStrength}</div>
                 </div>
                 <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>Generated</div>
                   <div style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                 </div>
               </div>

               <div style={{ padding: '20px', backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#3b82f6', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>Recommended Path</div>
                 <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>{result.case_assessment.consultantVerdict.recommendedPath}</div>
               </div>
             </div>

             <div style={{ textAlign: 'center', borderTop: '1px solid #eaeaea', paddingTop: '16px', marginTop: '20px' }}>
               <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px 0' }}><strong>Disclaimer:</strong> This document provides structural preparation assistance only. It does not constitute immigration or legal advice.</p>
               <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Generated: {new Date().toLocaleDateString()} | Strictly Confidential</p>
             </div>
          </div>

          {/* PAGE 2 — READINESS SCORE (Standard+) */}
          {hasFeature('readiness_score') && (
            <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', minHeight: '1100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e' }}>Application Readiness Score</h2>

              <div style={{ backgroundColor: '#f0f4ff', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #dbe4ff' }}>
                <div style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', color: result.case_assessment.score > 79 ? '#059669' : result.case_assessment.score > 59 ? '#2563eb' : result.case_assessment.score > 39 ? '#d97706' : '#dc2626', lineHeight: '1', marginBottom: '12px' }}>
                  {result.case_assessment.score}<span style={{ fontSize: '22px', color: '#888' }}>/100</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${result.case_assessment.score}%`, backgroundColor: result.case_assessment.score > 79 ? '#059669' : result.case_assessment.score > 59 ? '#2563eb' : result.case_assessment.score > 39 ? '#d97706' : '#dc2626', height: '100%', borderRadius: '4px' }}></div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', color: '#1a1a2e' }}>Readiness Outlook</h3>
              <div style={{ marginBottom: '28px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: '18px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: '700', marginBottom: '6px' }}>Current Readiness</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>{result.case_assessment.successOutlook?.currentReadiness || 'Low'}</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: '18px', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#059669', fontWeight: '700', marginBottom: '6px' }}>Post-Fixes Outlook</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{result.case_assessment.successOutlook?.readinessAfterFixes || 'Strong'}</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: '18px', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2563eb', fontWeight: '700', marginBottom: '6px' }}>Score Improvement</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>{result.case_assessment.successOutlook?.expectedScoreImprovement || '+20 Points'}</div>
                </div>
              </div>

              {result.case_assessment.successOutlook?.primaryObstacles?.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#dc2626', marginBottom: '10px' }}>Primary Obstacles to Address</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.8' }}>
                    {result.case_assessment.successOutlook.primaryObstacles.map((obs, i) => <li key={i}>{obs}</li>)}
                  </ul>
                </div>
              )}

              <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', color: '#1a1a2e' }}>Consultant Assessment</h3>
              <div style={{ marginBottom: '28px', backgroundColor: '#1a1a2e', color: '#fff', padding: '28px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600', marginBottom: '6px' }}>Recommended Path</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{result.case_assessment.consultantVerdict.recommendedPath}</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600', marginBottom: '6px' }}>Case Strength</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: result.case_assessment.score > 79 ? '#34d399' : result.case_assessment.score > 59 ? '#60a5fa' : result.case_assessment.score > 39 ? '#fbbf24' : '#f87171' }}>{result.case_assessment.consultantVerdict.currentCaseStrength}</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600', marginBottom: '6px' }}>Confidence Level</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>{result.case_assessment.consultantVerdict.confidenceLevel}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600', marginBottom: '6px' }}>Consultant Reasoning</div>
                  <p style={{ fontSize: '14px', margin: 0, color: '#e4e4e7', fontStyle: 'italic', lineHeight: '1.7' }}>"{result.case_assessment.consultantVerdict.reasoning}"</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#1a1a2e', marginBottom: '10px' }}>Consultant Notes</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {result.case_assessment.consultantNotes.map((note, i) => (
                    <li key={i} style={{ fontSize: '14px', color: '#333', marginBottom: '10px', lineHeight: '1.6' }}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* PAGE 3 — EXECUTIVE SUMMARY (Premium only) */}
          {hasFeature('executive_summary') && (
            <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', minHeight: '1100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e' }}>Executive Summary</h2>

              <div style={{ marginBottom: '28px', backgroundColor: '#1a1a2e', color: '#fff', padding: '28px', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', fontWeight: '700', marginBottom: '20px' }}>Case Overview</h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#e4e4e7', lineHeight: '1.8' }}>
                  Applicant <strong>{result.case_assessment.applicantName || 'Confidential Client'}</strong> applied for <strong>{result.case_assessment.caseType}</strong>. Current readiness score is <strong>{result.case_assessment.score}/100</strong>, rated as <strong>{result.case_assessment.severityRating}</strong>. {result.case_assessment.consultantVerdict.reasoning}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
                <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: '18px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: '700', marginBottom: '6px' }}>Current Readiness</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>{result.case_assessment.successOutlook?.currentReadiness || 'Low'}</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: '18px', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#059669', fontWeight: '700', marginBottom: '6px' }}>Post-Fixes Outlook</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{result.case_assessment.successOutlook?.readinessAfterFixes || 'Strong'}</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: '18px', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2563eb', fontWeight: '700', marginBottom: '6px' }}>Score Improvement</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>{result.case_assessment.successOutlook?.expectedScoreImprovement || '+20 Points'}</div>
                </div>
              </div>

              {result.case_assessment.consultantNotes.length > 0 && (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', color: '#1a1a2e' }}>Consultant Notes</h3>
                  <ul style={{ paddingLeft: '20px', marginBottom: '28px' }}>
                    {result.case_assessment.consultantNotes.map((note, i) => (
                      <li key={i} style={{ fontSize: '14px', color: '#333', marginBottom: '10px', lineHeight: '1.6' }}>{note}</li>
                    ))}
                  </ul>
                </>
              )}

              {result.case_assessment.successOutlook?.primaryObstacles?.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#dc2626', marginBottom: '10px' }}>Primary Obstacles to Address</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.8' }}>
                    {result.case_assessment.successOutlook.primaryObstacles.map((obs, i) => <li key={i}>{obs}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* PAGE 4 — WEAKNESS / REFUSAL ANALYSIS (Premium only) */}
          {hasFeature('refusal_analysis') && (
            <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', minHeight: '1100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e' }}>Weakness Analysis &amp; Refusal Breakdown</h2>

              {result.issues.map((issue, idx) => (
                <div key={idx} style={{ marginBottom: '28px', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#111' }}>{issue.issue}</h4>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', backgroundColor: issue.impact === 'Critical' ? '#fee2e2' : issue.impact === 'High' ? '#ffedd5' : '#dcfce7', color: issue.impact === 'Critical' ? '#991b1b' : issue.impact === 'High' ? '#9a3412' : '#166534', borderRadius: '20px', textTransform: 'uppercase' }}>{issue.impact}</span>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', marginBottom: '4px' }}>Consultant Finding</div>
                    <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{issue.finding}</div>
                  </div>

                  <div style={{ marginBottom: '16px', backgroundColor: '#f0f4ff', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#3b82f6', fontWeight: '700', marginBottom: '4px' }}>Recommended Resolution</div>
                    <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600', lineHeight: '1.5' }}>{issue.recommendedAction}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', marginBottom: '6px' }}>Required Evidence</div>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {issue.recommendedEvidence.map((ev, i) => (
                        <li key={i} style={{ fontSize: '14px', color: '#4b5563', marginBottom: '4px', lineHeight: '1.5' }}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REAPPLICATION STRATEGY (Standard+) */}
          {hasFeature('strategy') && (
            <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', minHeight: '1100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e' }}>Reapplication Strategy</h2>

              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', color: '#166534' }}>Immediate Actions</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                  {result.strategy.immediateActions.map((action, i) => <li key={i} style={{ marginBottom: '6px' }}>{action}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', color: '#1e40af' }}>Evidence To Gather</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                  {result.strategy.evidenceToGather.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', color: '#991b1b' }}>Common Mistakes To Avoid</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                  {result.strategy.commonMistakes.map((mistake, i) => <li key={i} style={{ marginBottom: '6px' }}>{mistake}</li>)}
                </ul>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>Target Timeline</h4>
                  <p style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#111' }}>{result.strategy.timeline}</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0fdf4' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: '#059669' }}>Expected Outcome</h4>
                  <p style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#059669' }}>{result.strategy.expectedOutcome}</p>
                </div>
              </div>
            </div>
          )}

          {/* STRUCTURED CHECKLIST (all paid plans, basic items for Starter, all categories for Standard+) */}
          {hasFeature('basic_checklist') && (
            <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', minHeight: '1100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e' }}>Document Checklist</h2>

              {result.checklist.identity && result.checklist.identity.length > 0 && (
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', color: '#334155', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', display: 'inline-block' }}>Identity Documents</h4>
                  {result.checklist.identity.map((item, i) => (
                    <div key={i} style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '18px', marginRight: '14px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.checklist.travel && result.checklist.travel.length > 0 && (
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', color: '#334155', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', display: 'inline-block' }}>Travel Documents</h4>
                  {result.checklist.travel.map((item, i) => (
                    <div key={i} style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '18px', marginRight: '14px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Categorized checklist items — Standard+ */}
              {hasFeature('categorized_checklist') && (
                <>
                  {result.checklist.financial && result.checklist.financial.length > 0 && (
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', color: '#334155', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', display: 'inline-block' }}>Financial Documents</h4>
                      {result.checklist.financial.map((item, i) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '18px', marginRight: '14px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.checklist.employment && result.checklist.employment.length > 0 && (
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', color: '#334155', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', display: 'inline-block' }}>Employment Documents</h4>
                      {result.checklist.employment.map((item, i) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '18px', marginRight: '14px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.checklist.academic && result.checklist.academic.length > 0 && (
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', color: '#334155', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', display: 'inline-block' }}>Academic Documents</h4>
                      {result.checklist.academic.map((item, i) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '18px', marginRight: '14px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.checklist.other && result.checklist.other.length > 0 && (
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px', color: '#334155', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', display: 'inline-block' }}>Other Documents</h4>
                      {result.checklist.other.map((item, i) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '18px', marginRight: '14px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* APPEAL LETTER (Starter+) */}
          {hasFeature('appeal_letter') && (
            <div style={{ padding: '60px 60px 40px', boxSizing: 'border-box', minHeight: '1100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e' }}>Supporting Explanation Draft</h2>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: "'Times New Roman', Times, serif", fontSize: '14px', lineHeight: '1.8', color: '#111', textAlign: 'justify', padding: '40px', border: '1px solid #e5e7eb', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                {result.appeal_letter}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
    </>
  );
}

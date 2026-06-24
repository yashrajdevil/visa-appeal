import { useState } from 'react';
import { Download, Copy, CheckCircle2, ChevronLeft, FileText, CheckSquare, Clock, Briefcase, AlertCircle, Lock, ShoppingCart, Loader2, Zap, Shield, Crown, X } from 'lucide-react';
import { GenerateAppealResponse, ChecklistItem } from '../types';
import SEO from './SEO';
import { markdownToHtml, stripMarkdown } from '../utils/markdownToHtml';

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
  { key: 'appeal_letter', label: 'Visa Reapplication Submission', starter: true, standard: true, premium: true },
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

    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'in', format: 'a4', orientation: 'portrait' });
      const PW = doc.internal.pageSize.getWidth();
      const PH = doc.internal.pageSize.getHeight();
      const M = 0.75;
      const CW = PW - 2 * M;
      const FS = 10;

      const safeText = (value: unknown, field?: string): string => {
        if (value === null || value === undefined) {
          if (field) console.error(`[PDF] Null/undefined value for field: ${field}`);
          return '';
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
          console.error(`[PDF] Non-string (${typeof value}) passed for "${field ?? 'unknown'}": ${String(value)}`);
          return String(value);
        }
        if (typeof value === 'string') {
          return value.replace(/•/g, '-').replace(/[–—]/g, '--').replace(/[""]/g, '"').replace(/['']/g, "'").replace(/…/g, '...');
        }
        if (Array.isArray(value)) {
          console.error(`[PDF] Array passed for "${field ?? 'unknown'}", joining as comma-separated`);
          return value.map(v => safeText(v)).join(', ');
        }
        console.error(`[PDF] Unexpected type (${typeof value}) for "${field ?? 'unknown'}"`);
        return String(value);
      };

      let y = M;
      let pg = 1;

      const np = () => { doc.addPage(); pg++; y = M; };
      const cp = (n: number) => { if (y + n > PH - M) np(); };
      const ftr = () => {
        doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.setTextColor(136, 136, 136);
        doc.text(`Page ${pg}`, PW - M, PH - 0.4, { align: 'right' });
        doc.text('Strictly Confidential', M, PH - 0.4);
        doc.setFontSize(FS); doc.setTextColor(0, 0, 0);
      };

      const { score } = result.case_assessment;
      const sc = score > 79 ? [5, 150, 105] : score > 59 ? [37, 99, 235] : score > 39 ? [217, 119, 6] : [220, 38, 38];

      // ===== PAGE 1: COVER =====
      y = M + 2.5;
      doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015);
      doc.line(M, y - 0.15, PW - M, y - 0.15);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(26);
      doc.setTextColor(26, 26, 46);
      doc.text('Lumera', M, y);
      y += 0.35;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
      doc.setTextColor(85, 85, 85);
      doc.text('AI Immigration Intelligence Platform', M, y);
      y += 0.5;
      doc.setDrawColor(26, 26, 46); doc.line(M, y, PW - M, y);
      y += 0.4;

      // Score box
      doc.setFillColor(240, 244, 255); doc.setDrawColor(219, 228, 255);
      doc.roundedRect(M, y, CW, 1.3, 0.08, 0.08, 'FD');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 59, 92);
      doc.text('APPLICATION READINESS SCORE', M + 0.15, y + 0.25);
      doc.setFontSize(36); doc.setFont('helvetica', 'bold');
      doc.setTextColor(sc[0], sc[1], sc[2]);
      doc.text(`${score}/100`, M + 0.15, y + 0.8);
      // Severity
      doc.setFontSize(9); doc.setTextColor(59, 59, 92);
      doc.text('SEVERITY RATING', PW - M - 1.6, y + 0.2);
      const sw = doc.getTextWidth(safeText(result.case_assessment.severityRating, 'severityRating')) + 0.3;
      doc.setFillColor(26, 26, 46);
      doc.roundedRect(PW - M - sw - 0.1, y + 0.28, sw, 0.22, 0.03, 0.03, 'F');
      doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      doc.text(safeText(result.case_assessment.severityRating, 'severityRating'), PW - M - sw / 2 - 0.1, y + 0.43, { align: 'center' });
      // Score bar
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(M + 0.15, y + 1.0, CW - 0.3, 0.1, 0.03, 0.03, 'F');
      doc.setFillColor(sc[0], sc[1], sc[2]);
      doc.roundedRect(M + 0.15, y + 1.0, (CW - 0.3) * score / 100, 0.1, 0.03, 0.03, 'F');
      y += 1.6;

      // Info grid
      const info: [string, string][] = [
        ['Applicant', result.case_assessment.applicantName || 'Confidential Client'],
        ['Visa Type', result.case_assessment.caseType],
        ['Case Strength', result.case_assessment.consultantVerdict.currentCaseStrength],
        ['Generated', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ];
      const cw = CW / 2 - 0.08;
      for (let i = 0; i < info.length; i++) {
        const c = i % 2, r = Math.floor(i / 2);
        const ix = M + c * (cw + 0.16);
        const iy = y + r * 0.85;
        doc.setDrawColor(229, 229, 235); doc.setFillColor(255, 255, 255);
        doc.roundedRect(ix, iy, cw, 0.7, 0.04, 0.04, 'FD');
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(136, 136, 136);
        doc.text(info[i][0].toUpperCase(), ix + 0.1, iy + 0.18);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
        doc.text(safeText(info[i][1], 'infoGrid_' + info[i][0]), ix + 0.1, iy + 0.48);
      }
      y += 1.85;

      // Recommended path
      doc.setFillColor(250, 250, 250); doc.setDrawColor(229, 229, 235);
      doc.roundedRect(M, y, CW, 0.75, 0.04, 0.04, 'FD');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246);
      doc.text('RECOMMENDED PATH', M + 0.15, y + 0.2);
      doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 26, 46);
      doc.text(safeText(result.case_assessment.consultantVerdict.recommendedPath, 'recommendedPath'), M + 0.15, y + 0.52);
      ftr();

      // ===== PAGE 2: READINESS SCORE (Standard+) =====
      if (hasFeature('readiness_score')) {
        np();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
        doc.setTextColor(26, 26, 46);
        doc.text('Application Readiness Score', M, y);
        y += 0.12;
        doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015); doc.line(M, y, PW - M, y);
        y += 0.35;

        doc.setFillColor(240, 244, 255); doc.setDrawColor(219, 228, 255);
        doc.roundedRect(M, y, CW, 0.9, 0.08, 0.08, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(36);
        doc.setTextColor(sc[0], sc[1], sc[2]);
        doc.text(`${score}/100`, PW / 2, y + 0.48, { align: 'center' });
        doc.setFillColor(229, 231, 235);
        doc.roundedRect(M + 0.25, y + 0.62, CW - 0.5, 0.12, 0.03, 0.03, 'F');
        doc.setFillColor(sc[0], sc[1], sc[2]);
        doc.roundedRect(M + 0.25, y + 0.62, (CW - 0.5) * score / 100, 0.12, 0.03, 0.03, 'F');
        y += 1.2;

        const ol = result.case_assessment.successOutlook;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(26, 26, 46);
        doc.text('Readiness Outlook', M, y);
        y += 0.3;

        const cards = [
          { l: 'Current Readiness', v: ol?.currentReadiness || 'Low', c: [17, 17, 17], b: [255, 255, 255] },
          { l: 'Post-Fixes Outlook', v: ol?.readinessAfterFixes || 'Strong', c: [5, 150, 105], b: [240, 253, 244] },
          { l: 'Score Improvement', v: ol?.expectedScoreImprovement || '+20 Points', c: [37, 99, 235], b: [239, 246, 255] },
        ];
        const cw3 = (CW - 0.3) / 3;
        for (let i = 0; i < 3; i++) {
          const cx = M + i * (cw3 + 0.15);
          doc.setFillColor(cards[i].b[0], cards[i].b[1], cards[i].b[2]);
          doc.setDrawColor(229, 229, 235);
          doc.roundedRect(cx, y, cw3, 0.65, 0.04, 0.04, 'FD');
          doc.setFontSize(7); doc.setFont('helvetica', 'bold');
          doc.setTextColor(cards[i].c[0], cards[i].c[1], cards[i].c[2]);
          doc.text(cards[i].l.toUpperCase(), cx + 0.1, y + 0.18);
          doc.setFontSize(13); doc.setFont('helvetica', 'bold');
          doc.text(safeText(cards[i].v, 'readinessCard_' + cards[i].l), cx + 0.1, y + 0.48);
        }
        y += 0.9;

        if (ol?.primaryObstacles?.length) {
          cp(ol.primaryObstacles.length * 0.22 + 0.4);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
          doc.setTextColor(220, 38, 38);
          doc.text('Primary Obstacles to Address', M, y);
          y += 0.22;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(68, 68, 68);
          for (const o of ol.primaryObstacles) { cp(0.22); doc.text(`- ${o}`, M + 0.15, y); y += 0.22; }
          y += 0.15;
        }

        cp(3.2);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(26, 26, 46);
        doc.text('Consultant Assessment', M, y);
        y += 0.3;

        const bh = 2.4;
        doc.setFillColor(26, 26, 46); doc.roundedRect(M, y, CW, bh, 0.06, 0.06, 'F');
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(148, 163, 184);
        const mw3 = (CW - 0.6) / 3;
        doc.text('RECOMMENDED PATH', M + 0.2, y + 0.2);
        doc.text('CASE STRENGTH', M + 0.2 + mw3 + 0.2, y + 0.2);
        doc.text('CONFIDENCE LEVEL', M + 0.2 + 2 * (mw3 + 0.2), y + 0.2);
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text(safeText(result.case_assessment.consultantVerdict.recommendedPath, 'recommendedPath'), M + 0.2, y + 0.5);
        doc.text(safeText(result.case_assessment.consultantVerdict.currentCaseStrength, 'currentCaseStrength'), M + 0.2 + mw3 + 0.2, y + 0.5);
        doc.text(safeText(result.case_assessment.consultantVerdict.confidenceLevel, 'confidenceLevel'), M + 0.2 + 2 * (mw3 + 0.2), y + 0.5);

        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(148, 163, 184);
        doc.text('CONSULTANT REASONING', M + 0.2, y + 0.8);
        const rl = doc.splitTextToSize(safeText(stripMarkdown(result.case_assessment.consultantVerdict.reasoning)), CW - 0.6);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(228, 228, 231);
        let ry = y + 1.0;
        for (const l of rl) { if (ry > y + bh - 0.15) break; doc.text(l, M + 0.2, ry); ry += 0.17; }
        y += bh + 0.3;

        if (result.case_assessment.consultantNotes.length) {
          cp(result.case_assessment.consultantNotes.length * 0.24 + 0.3);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(26, 26, 46);
          doc.text('Consultant Notes', M, y);
          y += 0.25;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(51, 51, 51);
          for (const n of result.case_assessment.consultantNotes) {
            const nl = doc.splitTextToSize(safeText(stripMarkdown(n)), CW - 0.3);
            for (const l of nl) { cp(0.2); doc.text(`-  ${l}`, M + 0.05, y); y += 0.2; }
            y += 0.08;
          }
        }
        ftr();
      }

      // ===== PAGE 3: EXECUTIVE SUMMARY (Premium) =====
      if (hasFeature('executive_summary')) {
        np();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(26, 26, 46);
        doc.text('Executive Summary', M, y);
        y += 0.12; doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015); doc.line(M, y, PW - M, y);
        y += 0.35;

        doc.setFillColor(26, 26, 46); doc.roundedRect(M, y, CW, 1.0, 0.06, 0.06, 'F');
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(148, 163, 184);
        doc.text('CASE OVERVIEW', M + 0.2, y + 0.25);
        const summary = `Applicant ${result.case_assessment.applicantName || 'Confidential Client'} applied for ${result.case_assessment.caseType}. Current readiness score is ${score}/100, rated as ${result.case_assessment.severityRating}. ${safeText(stripMarkdown(result.case_assessment.consultantVerdict.reasoning))}`;
        const sl = doc.splitTextToSize(summary, CW - 0.4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(228, 228, 231);
        let sy = y + 0.5;
        for (const l of sl) { doc.text(l, M + 0.2, sy); sy += 0.18; }
        y += 1.3;

        const ol2 = result.case_assessment.successOutlook;
        const ecards = [
          { l: 'Current Readiness', v: ol2?.currentReadiness || 'Low', c: [17, 17, 17], b: [255, 255, 255] },
          { l: 'Post-Fixes Outlook', v: ol2?.readinessAfterFixes || 'Strong', c: [5, 150, 105], b: [240, 253, 244] },
          { l: 'Score Improvement', v: ol2?.expectedScoreImprovement || '+20 Points', c: [37, 99, 235], b: [239, 246, 255] },
        ];
        const ecw = (CW - 0.3) / 3;
        for (let i = 0; i < 3; i++) {
          const cx = M + i * (ecw + 0.15);
          doc.setFillColor(ecards[i].b[0], ecards[i].b[1], ecards[i].b[2]);
          doc.setDrawColor(229, 229, 235);
          doc.roundedRect(cx, y, ecw, 0.65, 0.04, 0.04, 'FD');
          doc.setFontSize(7); doc.setFont('helvetica', 'bold');
          doc.setTextColor(ecards[i].c[0], ecards[i].c[1], ecards[i].c[2]);
          doc.text(ecards[i].l.toUpperCase(), cx + 0.1, y + 0.18);
          doc.setFontSize(13); doc.setFont('helvetica', 'bold');
          doc.text(safeText(ecards[i].v, 'execSummaryCard_' + ecards[i].l), cx + 0.1, y + 0.48);
        }
        y += 0.9;

        if (result.case_assessment.consultantNotes.length) {
          cp(result.case_assessment.consultantNotes.length * 0.24 + 0.3);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(26, 26, 46);
          doc.text('Consultant Notes', M, y);
          y += 0.25;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(51, 51, 51);
          for (const n of result.case_assessment.consultantNotes) {
            const nl = doc.splitTextToSize(safeText(stripMarkdown(n)), CW - 0.3);
            for (const l of nl) { cp(0.2); doc.text(`-  ${l}`, M + 0.05, y); y += 0.2; }
            y += 0.08;
          }
        }

        if (ol2?.primaryObstacles?.length) {
          cp(ol2.primaryObstacles.length * 0.22 + 0.5);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(220, 38, 38);
          doc.text('Primary Obstacles to Address', M, y);
          y += 0.25;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(68, 68, 68);
          for (const o of ol2.primaryObstacles) { cp(0.22); doc.text(`- ${o}`, M + 0.15, y); y += 0.22; }
        }
        ftr();
      }

      // ===== PAGE 4+: REFUSAL ANALYSIS (Premium) =====
      if (hasFeature('refusal_analysis')) {
        np();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(26, 26, 46);
        doc.text('Weakness Analysis & Refusal Breakdown', M, y);
        y += 0.12; doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015); doc.line(M, y, PW - M, y);
        y += 0.35;

        for (let idx = 0; idx < result.issues.length; idx++) {
          const issue = result.issues[idx];
          const itemH = 3.0 + (issue.recommendedEvidence?.length || 0) * 0.18;
          cp(itemH);
          if (y > M + 0.5 && idx > 0) { np(); y = M; }

          doc.setDrawColor(229, 229, 235); doc.setFillColor(255, 255, 255);
          doc.roundedRect(M, y, CW, 0.45, 0.04, 0.04, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(17, 17, 17);
          doc.text(safeText(issue.issue, 'issueName'), M + 0.15, y + 0.28);
          // Impact badge
          const impC = issue.impact === 'Critical' ? [153, 27, 27] : issue.impact === 'High' ? [154, 52, 18] : [22, 101, 52];
          const impBg = issue.impact === 'Critical' ? [254, 226, 226] : issue.impact === 'High' ? [255, 237, 213] : [220, 252, 231];
          const iw = doc.getTextWidth(safeText(issue.impact, 'issueImpact_width')) + 0.2;
          doc.setFillColor(impBg[0], impBg[1], impBg[2]);
          doc.roundedRect(PW - M - iw - 0.1, y + 0.08, iw, 0.2, 0.03, 0.03, 'F');
          doc.setFontSize(7); doc.setFont('helvetica', 'bold');
          doc.setTextColor(impC[0], impC[1], impC[2]);
          doc.text(safeText(issue.impact, 'issueImpact'), PW - M - iw / 2 - 0.1, y + 0.22, { align: 'center' });
          y += 0.6;

          cp(2.8);
          doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 114, 128);
          doc.text('Consultant Finding', M + 0.15, y);
          y += 0.2;
          const fLines = doc.splitTextToSize(safeText(stripMarkdown(issue.finding)), CW - 0.3);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(55, 65, 81);
          for (const l of fLines) { cp(0.2); doc.text(l, M + 0.15, y); y += 0.2; }
          y += 0.2;

          cp(2.0);
          doc.setFillColor(240, 244, 255);
          doc.roundedRect(M, y, CW, 0.7, 0.04, 0.04, 'F');
          doc.setDrawColor(59, 130, 246); doc.setLineWidth(0.03); doc.line(M, y, M, y + 0.7);
          doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246);
          doc.text('Recommended Resolution', M + 0.2, y + 0.18);
          const aLines = doc.splitTextToSize(safeText(stripMarkdown(issue.recommendedAction)), CW - 0.5);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 64, 175);
          let ay = y + 0.38;
          for (const l of aLines) { doc.text(l, M + 0.2, ay); ay += 0.17; }
          y += 0.9;

          cp(issue.recommendedEvidence.length * 0.18 + 0.3);
          doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 114, 128);
          doc.text('Required Evidence', M + 0.15, y);
          y += 0.2;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(75, 85, 99);
          for (const ev of issue.recommendedEvidence) {
            cp(0.18); doc.text(`- ${ev}`, M + 0.3, y); y += 0.18;
          }
          y += 0.25;
        }
        ftr();
      }

      // ===== PAGE 5+: REAPPLICATION STRATEGY (Standard+) =====
      if (hasFeature('strategy')) {
        np();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(26, 26, 46);
        doc.text('Reapplication Strategy', M, y);
        y += 0.12; doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015); doc.line(M, y, PW - M, y);
        y += 0.35;

        const sections: [string, string[], number[]][] = [
          ['Immediate Actions', result.strategy.immediateActions, [22, 101, 52]],
          ['Evidence To Gather', result.strategy.evidenceToGather, [30, 64, 175]],
          ['Common Mistakes To Avoid', result.strategy.commonMistakes, [153, 27, 27]],
        ];

        for (const [title, items, color] of sections) {
          cp(items.length * 0.22 + 0.6);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(title.toUpperCase(), M, y);
          y += 0.25;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(51, 65, 85);
          for (const item of items) {
            const il = doc.splitTextToSize(safeText(stripMarkdown(item)), CW - 0.3);
            for (const l of il) { cp(0.2); doc.text(`-  ${l}`, M + 0.1, y); y += 0.2; }
            y += 0.05;
          }
          y += 0.2;
        }

        cp(1.2);
        const tw = (CW - 0.3) / 2;
        doc.setDrawColor(229, 229, 235); doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, y, tw, 0.7, 0.04, 0.04, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(136, 136, 136);
        doc.text('TARGET TIMELINE', M + 0.15, y + 0.2);
        doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
        doc.text(safeText(result.strategy.timeline, 'timeline'), M + 0.15, y + 0.5);

        doc.setDrawColor(229, 229, 235); doc.setFillColor(240, 253, 244);
        doc.roundedRect(M + tw + 0.3, y, tw, 0.7, 0.04, 0.04, 'FD');
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(5, 150, 105);
        doc.text('EXPECTED OUTCOME', M + tw + 0.45, y + 0.2);
        doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(5, 150, 105);
        doc.text(safeText(result.strategy.expectedOutcome, 'expectedOutcome'), M + tw + 0.45, y + 0.5);
        ftr();
      }

      // ===== PAGE 6+: DOCUMENT CHECKLIST (all paid) =====
      if (hasFeature('basic_checklist')) {
        np();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(26, 26, 46);
        doc.text('Document Checklist', M, y);
        y += 0.12; doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015); doc.line(M, y, PW - M, y);
        y += 0.35;

        const renderCat = (title: string, items: ChecklistItem[]) => {
          if (!items?.length) return;
          const estH = items.length * 0.35 + 0.5;
          cp(estH);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(51, 65, 85);
          doc.text(title.toUpperCase(), M, y);
          y += 0.05;
          doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.012);
          doc.line(M, y, M + doc.getTextWidth(title.toUpperCase()) + 0.3, y);
          y += 0.2;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
          for (const item of items) {
            cp(0.35);
            doc.setTextColor(100, 116, 139);
            doc.text('[ ]', M, y - 0.02);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            const iLines = doc.splitTextToSize(safeText(item.item), CW - 0.5);
            doc.text(iLines, M + 0.35, y);
            if (iLines.length > 1) y += (iLines.length - 1) * 0.17 + 0.05;
            y += 0.02;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const eLines = doc.splitTextToSize(safeText(item.explanation), CW - 0.5);
            for (const l of eLines) { cp(0.16); doc.text(l, M + 0.35, y); y += 0.16; }
            y += 0.12;
          }
          y += 0.1;
        };

        renderCat('Identity Documents', result.checklist.identity);
        renderCat('Travel Documents', result.checklist.travel);

        if (hasFeature('categorized_checklist')) {
          renderCat('Financial Documents', result.checklist.financial);
          renderCat('Employment Documents', result.checklist.employment);
          renderCat('Academic Documents', result.checklist.academic);
          renderCat('Other Documents', result.checklist.other);
        }
        ftr();
      }

      // ===== PAGE 7+: APPEAL LETTER (Starter+) =====
      if (hasFeature('appeal_letter')) {
        np();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(26, 26, 46);
        doc.text('Visa Reapplication Submission', M, y);
        y += 0.12; doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.015); doc.line(M, y, PW - M, y);
        y += 0.35;

        doc.setDrawColor(229, 229, 235); doc.setFillColor(250, 250, 250);
        doc.roundedRect(M, y, CW, 0.5, 0.03, 0.03, 'FD');
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        doc.text('The following is a professionally drafted reapplication submission for your visa application.', M + 0.15, y + 0.3);
        y += 0.7;

        doc.setFont('times', 'normal'); doc.setFontSize(11); doc.setTextColor(17, 17, 17);
        const letterLines = doc.splitTextToSize(safeText(stripMarkdown(result.appeal_letter)), CW - 0.6);
        for (const l of letterLines) {
          cp(0.2);
          doc.text(l, M + 0.15, y);
          y += 0.2;
        }
        ftr();
      }

      doc.save('Lumera_Appeal_Package.pdf');
    } catch (err: any) {
      console.error('[PDF] Generation failed:', err.message, err);
      alert('An error occurred while generating the PDF. Please try again or use the Copy button to save your content in the meantime.');
    } finally {
      setPdfLoading(false);
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
      <SEO title="Appeal Results | Lumera" description="" noindex={true} />
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
                       "{stripMarkdown(result.case_assessment.consultantVerdict.reasoning)}"
                    </p>

                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Consultant Notes</h4>
                    <ul className="space-y-3 mb-6">
                        {result.case_assessment.consultantNotes.map((note, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                            <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: markdownToHtml(note) }} />
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
                      <div className="text-sm text-zinc-300" dangerouslySetInnerHTML={{ __html: markdownToHtml(issue.finding) }} />
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Recommended Action</div>
                      <div className="text-sm text-indigo-300 font-medium" dangerouslySetInnerHTML={{ __html: markdownToHtml(issue.recommendedAction) }} />
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
                    <div className="font-serif text-[15px] leading-[1.8] text-[#1a1a1a] tracking-normal text-justify">
                      {hasFeature('appeal_letter') || isSample ? (
                        <div className="outline-none focus:ring-2 ring-indigo-500/20 rounded-md p-2 -m-2 transition-all" dangerouslySetInnerHTML={{ __html: markdownToHtml(result.appeal_letter) }} contentEditable suppressContentEditableWarning />
                      ) : (
                        <>
                          <div>{stripMarkdown(result.appeal_letter).slice(0, 300)}...</div>
                          <div className="mt-4 blur-[4px] opacity-40 select-none">
                            {stripMarkdown(result.appeal_letter).slice(300, 1500)}
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
                      <span dangerouslySetInnerHTML={{ __html: markdownToHtml(action) }} />
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
                      <span dangerouslySetInnerHTML={{ __html: markdownToHtml(item) }} />
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
                      <span dangerouslySetInnerHTML={{ __html: markdownToHtml(mistake) }} />
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



    </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createCheckout } from '../services/api';
import ResultsDashboard from './ResultsDashboard';
import { GenerateAppealResponse } from '../types';
import { Loader2, AlertTriangle, ShoppingCart, Lock } from 'lucide-react';

interface Props {
  onReset: () => void;
}

interface CaseData {
  analysisData: GenerateAppealResponse;
  paymentStatus: string;
  purchasedPlan: string;
  country: string;
  visaType: string;
}

const PLAN_DETAILS = [
  { id: 'starter', name: 'Starter', price: '$9.99', features: ['Document Draft', 'Basic Checklist', 'PDF Export'] },
  { id: 'standard', name: 'Standard', price: '$19.99', features: ['Everything in Starter', 'Readiness Score', 'Reapplication Planner', 'Country-Specific Recommendations', 'Embassy-Ready Formatting'] },
  { id: 'premium', name: 'Premium', price: '$34.99', features: ['Everything in Standard', 'Detailed Refusal Analysis', 'Evidence Roadmap', 'Weakness Analysis', 'Readiness Outlook Report', 'Complete Premium PDF Package'] },
];

export default function ResultsViewResolver({ onReset }: Props) {
  const { caseId: paramCaseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseId = paramCaseId || searchParams.get('caseId');
  const isPurchaseSuccess = searchParams.get('purchase') === 'success';

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!caseId) {
      navigate('/flow');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const caseRef = doc(db, 'users', user.uid, 'cases', caseId);

    const unsubscribe = onSnapshot(caseRef, (snap) => {
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = snap.data() as CaseData;
      setCaseData(data);
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [caseId, navigate]);

  const handlePurchase = async (plan: 'starter' | 'standard' | 'premium') => {
    if (!caseId) return;
    setPurchasing(true);
    try {
      const { checkoutUrl } = await createCheckout({ caseId, plan });
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert('Failed to create checkout: ' + err.message);
      setPurchasing(false);
    }
  };

  if (!caseId) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-semibold text-white">Case not found</h2>
        <p className="text-zinc-400">This case may have been deleted or you may not have access.</p>
        <button onClick={onReset} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition">
          Start New Analysis
        </button>
      </div>
    );
  }

  const paymentStatus = caseData.paymentStatus;
  const purchasedPlan = caseData.purchasedPlan;
  const isLocked = paymentStatus !== 'completed';

  if (isPurchaseSuccess && isLocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <h2 className="text-xl font-semibold text-white">Processing your purchase...</h2>
        <p className="text-zinc-400">Your results will unlock automatically once payment is confirmed.</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Unlock Your Reapplication Preparation Package</h1>
        </div>
        <p className="text-zinc-400 mb-8">
          Your analysis is ready. Choose a plan to unlock the full appeal package including the appeal letter, checklists, and strategy planner.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLAN_DETAILS.map((plan) => (
            <div key={plan.id} className={`bg-zinc-900 border rounded-2xl p-6 flex flex-col ${plan.id === 'standard' ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : 'border-zinc-800'}`}>
              {plan.id === 'standard' && (
                <div className="text-center -mt-10 mb-4">
                  <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded-full">Most Popular</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-6">{plan.price}</div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan.id as 'starter' | 'standard' | 'premium')}
                disabled={purchasing}
                className="w-full py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                {purchasing ? 'Redirecting...' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onReset} className="text-sm text-zinc-400 hover:text-white transition mx-auto block">
          Start a new analysis
        </button>
      </div>
    );
  }

  return <ResultsDashboard result={caseData.analysisData} onReset={onReset} purchasedPlan={purchasedPlan} />;
}

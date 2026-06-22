import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createCheckout } from '../services/api';
import ResultsDashboard from './ResultsDashboard';
import { GenerateAppealResponse } from '../types';
import { Loader2, AlertTriangle } from 'lucide-react';

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

  if (isPurchaseSuccess && caseData.paymentStatus !== 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <h2 className="text-xl font-semibold text-white">Processing your purchase...</h2>
        <p className="text-zinc-400">Your results will unlock automatically once payment is confirmed.</p>
      </div>
    );
  }

  return (
    <ResultsDashboard
      result={caseData.analysisData}
      onReset={onReset}
      purchasedPlan={caseData.paymentStatus === 'completed' ? caseData.purchasedPlan : ''}
      onPurchase={handlePurchase}
      isPurchasing={purchasing}
    />
  );
}

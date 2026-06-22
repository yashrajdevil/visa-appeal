import { useEffect, useState, Component } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createCheckout } from '../services/api';
import ResultsDashboard from './ResultsDashboard';
import { GenerateAppealResponse } from '../types';
import { Loader2, AlertTriangle, Clock } from 'lucide-react';

function PurchasePending({ caseId, paymentStatus }: { caseId: string; paymentStatus: string }) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDiagnostics(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!showDiagnostics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <h2 className="text-xl font-semibold text-white">Processing your purchase...</h2>
        <p className="text-zinc-400">Your results will unlock automatically once payment is confirmed.</p>
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <Clock className="w-12 h-12 text-amber-400" />
      <h2 className="text-xl font-semibold text-white">Payment Confirmed — Waiting for Processing</h2>
      <p className="text-zinc-400 text-center max-w-md">
        Your payment was received but the unlock hasn't completed yet.
        If this persists, try refreshing the page.
      </p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg space-y-2 text-sm font-mono">
        <div className="text-zinc-300"><span className="text-zinc-500">caseId:</span> {caseId}</div>
        <div className="text-zinc-300"><span className="text-zinc-500">paymentStatus:</span> {paymentStatus}</div>
        <div className="text-zinc-300"><span className="text-zinc-500">request_id:</span> {params.get('request_id') || 'N/A'}</div>
        <div className="text-zinc-300"><span className="text-zinc-500">checkout_id:</span> {params.get('checkout_id') || 'N/A'}</div>
        <div className="text-zinc-300"><span className="text-zinc-500">order_id:</span> {params.get('order_id') || 'N/A'}</div>
        <div className="text-zinc-300"><span className="text-zinc-500">customer_id:</span> {params.get('customer_id') || 'N/A'}</div>
        <div className="text-zinc-300"><span className="text-zinc-500">product_id:</span> {params.get('product_id') || 'N/A'}</div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
      >
        Refresh
      </button>
    </div>
  );
}

class ResultsErrorBoundary extends Component<
  { children: React.ReactNode; caseId?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; caseId?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('=== ERROR BOUNDARY CAUGHT ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component stack:', info.componentStack);
    console.error('CaseId:', this.props.caseId);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
          <AlertTriangle className="w-12 h-12 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">Rendering Error</h2>
          <pre className="text-sm text-rose-300 bg-zinc-900 p-4 rounded-xl max-w-2xl overflow-auto whitespace-pre-wrap border border-zinc-800">
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <p className="text-zinc-400">CaseId: {this.props.caseId}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const location = useLocation();
  const caseId = paramCaseId || searchParams.get('caseId');
  const isPurchaseSuccess = searchParams.get('purchase') === 'success';

  console.log('=== Results page mounted ===');
  console.log('CaseId:', caseId);
  console.log('Location state:', location.state);
  console.log('Search params:', Object.fromEntries(searchParams.entries()));
  console.log('Auth user:', auth.currentUser?.uid);

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
    return <PurchasePending caseId={caseId} paymentStatus={caseData.paymentStatus} />;
  }

  const analysisData = caseData.analysisData;
  console.log('=== Analysis data diagnostics ===');
  console.log('analysisData type:', typeof analysisData);
  console.log('analysisData keys:', typeof analysisData === 'object' && analysisData !== null ? Object.keys(analysisData) : 'N/A');

  // Resolve analysisData from any storage format to GenerateAppealResponse
  function resolveAnalysisData(raw: unknown): GenerateAppealResponse {
    // Format 1: JSON string (old pre-Phase 2 server)
    if (typeof raw === 'string') {
      console.warn('analysisData is a STRING (old format), parsing');
      try {
        const parsed = JSON.parse(raw);
        return resolveAnalysisData(parsed);
      } catch { return raw as unknown as GenerateAppealResponse; }
    }
    // Format 2: Gemini API envelope (broken fallback rewrite — this case)
    if (raw && typeof raw === 'object' && !('case_assessment' in (raw as any))) {
      const maybeEnvelope = raw as any;
      const textFromCandidates = maybeEnvelope?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textFromCandidates) {
        console.warn('analysisData is a Gemini API envelope, extracting inner text');
        try {
          const extracted = JSON.parse(textFromCandidates);
          if (extracted?.case_assessment) return extracted;
        } catch { /* not JSON, fall through */ }
      }
    }
    // Format 3: Assume it's already GenerateAppealResponse
    return raw as GenerateAppealResponse;
  }

  const resolvedResult = resolveAnalysisData(analysisData);
  console.log('resolvedResult keys:', Object.keys(resolvedResult));
  console.log('has case_assessment:', !!resolvedResult.case_assessment);

  return (
    <ResultsErrorBoundary caseId={caseId}>
      <ResultsDashboard
        result={resolvedResult}
        onReset={onReset}
        purchasedPlan={caseData.paymentStatus === 'completed' ? caseData.purchasedPlan : ''}
        onPurchase={handlePurchase}
        isPurchasing={purchasing}
      />
    </ResultsErrorBoundary>
  );
}

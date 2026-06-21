import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ResultsDashboard from './ResultsDashboard';
import { GenerateAppealResponse } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface Props {
  memoryResult: GenerateAppealResponse | null;
  onReset: () => void;
}

export default function ResultsViewResolver({ memoryResult, onReset }: Props) {
  const { caseId: paramCaseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseId = paramCaseId || searchParams.get('caseId');
  
  const [dbResult, setDbResult] = useState<GenerateAppealResponse | null>(null);
  const [initialPlan, setInitialPlan] = useState<'free' | 'starter' | 'standard' | 'premium'>('free');
  const [loading, setLoading] = useState(!!caseId);
  const { user } = useCustomerAuth();

  useEffect(() => {
    if (caseId && user) {
      setLoading(true);
      const caseRef = doc(db, 'users', user.id, 'cases', caseId);
      getDoc(caseRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.analysisData) {
             const parsed = JSON.parse(data.analysisData);
             parsed.caseId = docSnap.id;
             if (data.paymentStatus === 'paid' && data.purchasedPlan) {
               setInitialPlan(data.purchasedPlan);
             }
             setDbResult(parsed);
             console.log(`RESULTS LOADED: ${docSnap.id}`);
          } else {
             navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }).catch(err => {
        console.error(err);
        navigate('/dashboard');
      }).finally(() => setLoading(false));
    } else if (caseId && !user) {
      // Waiting for user to load...
      // Or maybe there is a timeout needed here if they're actually not logged in?
      // In worst case they get stuck loading. We'll leave it as is for user context resolution.
    } else {
      setLoading(false);
    }
  }, [caseId, navigate, user]);

  if (loading) {
     return <div className="min-h-screen py-40 text-center text-white"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Loading case...</div>;
  }

  const resultToUse = dbResult || memoryResult;

  if (!resultToUse) {
    navigate('/flow');
    return null;
  }

  return <ResultsDashboard result={resultToUse} onReset={onReset} initialPlan={initialPlan} />;
}

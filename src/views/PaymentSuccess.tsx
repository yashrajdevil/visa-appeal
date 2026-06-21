import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function PaymentSuccessView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');

  useEffect(() => {
    if (caseId) {
      navigate(`/results/${caseId}`);
    } else {
      navigate('/dashboard/cases');
    }
  }, [navigate, caseId]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 mt-20 text-center">
       <h2 className="text-3xl font-bold mb-4 text-emerald-400">Payment Successful!</h2>
       <p className="text-zinc-400 mb-8">Loading your report...</p>
       <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    </div>
  );
}

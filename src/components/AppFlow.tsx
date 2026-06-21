import React from 'react';
import CaseWizard from './CaseWizard';
import { AppealFormData } from '../types';
import SEO from './SEO';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AppFlowProps {
  onStart: (data: AppealFormData) => void;
}

export default function AppFlow({ onStart }: AppFlowProps) {
  const { user, loading } = useCustomerAuth();

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SEO title="Configure Appeal | Visa Appeal Builder" description="" noindex={true} />
      <div className="min-h-[80vh] pt-24 pb-12 px-6 flex flex-col items-center justify-center">
        <CaseWizard onSubmit={onStart} />
      </div>
    </>
  );
}

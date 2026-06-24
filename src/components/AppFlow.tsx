import React from 'react';
import CaseWizard from './CaseWizard';
import { AppealFormData } from '../types';
import SEO from './SEO';

interface AppFlowProps {
  onStart: (data: AppealFormData) => void;
}

export default function AppFlow({ onStart }: AppFlowProps) {
  return (
    <>
      <SEO title="Configure Appeal | Lumera" description="" noindex={true} />
      <div className="min-h-[80vh] pt-24 pb-12 px-6 flex flex-col items-center justify-center">
        <CaseWizard onSubmit={onStart} />
      </div>
    </>
  );
}

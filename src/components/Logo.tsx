import React from 'react';

export const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="6" y="14" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="3" />
    <rect x="14" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
  </svg>
);

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon className="w-8 h-8 text-white" />
      <span className="font-bold text-[1.1rem] tracking-tight text-white leading-none mt-0.5">
        Visa Appeal AI
      </span>
    </div>
  );
};

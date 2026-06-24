import React from 'react';

export const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" />
    <path d="M10 20 L16 8 L22 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="11.5" y1="17" x2="20.5" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon className="w-8 h-8 text-white" />
      <span className="font-bold text-[1.1rem] tracking-tight text-white leading-none mt-0.5">
        Lumera AI
      </span>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import SEO from './SEO';

const steps = [
  "Uploading document...",
  "Extracting core rejection reasons...",
  "Analyzing legal precedence & guidelines...",
  "Generating targeted fix strategy...",
  "Drafting professional appeal letter...",
  "Preparing results..."
];

interface ProcessingViewProps {
  error?: { message: string, details?: string } | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function ProcessingView({ error: initialError, onRetry, onCancel }: ProcessingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeoutError, setTimeoutError] = useState<{ message: string, details?: string } | null>(null);

  const error = timeoutError || initialError;

  useEffect(() => {
    if (error) return; // Stop animation if there's an error
    
    // We have 6 steps. Let's make it look realistic by staggering the timing.
    // The exact progress depends on the actual API taking 10-15s, so we stay on step 3-4 longer.
    const timers = [
      setTimeout(() => setCurrentStep(1), 800),     // Extracting...
      setTimeout(() => setCurrentStep(2), 2500),    // Analyzing...
      setTimeout(() => setCurrentStep(3), 5000),    // Generating strategy...
      setTimeout(() => setCurrentStep(4), 8500),    // Drafting letter...
      setTimeout(() => setCurrentStep(5), 14000),   // Preparing results...
      setTimeout(() => {
        setTimeoutError({
          message: "Operation timed out",
          details: "The server took too long to respond. The document may be too large or the AI services may be experiencing high load."
        });
      }, 60000) // 60 seconds timeout fallback
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [error, initialError]);

  return (
    <>
      <SEO title="Processing... | Visa Appeal Builder" description="" noindex={true} />
      <div className="min-h-screen flex flex-col items-center justify-center -mt-16 z-20 relative px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl"
        >
          {error ? (
            <div className="w-full text-center">
              <div className="relative w-20 h-20 mb-6 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl"></div>
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Analysis could not be completed.</h2>
              <p className="text-sm text-rose-400 mb-1">{error.message}</p>
              {error.details && (
                <p className="text-xs text-zinc-500 mb-6 bg-zinc-950 p-3 rounded-lg border border-zinc-800 overflow-x-auto text-left">
                  <span className="block font-semibold mb-1 text-zinc-400">Error Details:</span>
                  {error.details}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Retry Upload
                </button>
                <button
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-colors text-sm"
                >
                  <AlertTriangle className="w-4 h-4" /> Start New Analysis
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                <Loader2 className="w-8 h-8 text-indigo-400 animate-pulse" />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>

              <div className="w-full space-y-4">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;

                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 text-sm transition-all duration-300 ${isActive ? 'text-white font-medium' : isCompleted ? 'text-zinc-500' : 'text-zinc-700 opacity-50'}`}
                    >
                      <div className="w-5 h-5 flex flex-shrink-0 items-center justify-center">
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        ) : isActive ? (
                          <motion.div 
                            className="w-2 h-2 bg-indigo-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                        )}
                      </div>
                      <span className={`${isActive ? 'animate-pulse' : ''}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}

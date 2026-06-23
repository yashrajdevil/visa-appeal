import React from 'react';
import { motion } from 'motion/react';
import { FileText, TrendingUp, FileCheck2, UploadCloud, Download } from 'lucide-react';

export const UploadAnimation = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />
      <div className="absolute w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-colors duration-1000" />
      
      {/* Upload Zone Dashed Ring */}
      <motion.div 
        className="absolute w-56 h-56 rounded-full border border-dashed border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors duration-700"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        className="absolute w-40 h-40 rounded-full border border-indigo-500/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Document */}
      <motion.div 
        className="relative z-10 w-28 h-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-3 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] group-hover:border-indigo-500/30 transition-all duration-700"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
            <UploadCloud className="w-4 h-4" />
        </div>
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full"></div>
        <div className="w-8 h-1.5 bg-zinc-800 rounded-full"></div>
        
        {/* Progress bar line */}
        <div className="absolute bottom-4 left-4 right-4 h-1 bg-zinc-950 border border-zinc-800/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.8, 1] }}
            />
        </div>
      </motion.div>
    </div>
  );
};

export const AnalysisAnimation = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />
      <div className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-1000" />
      
      <div className="relative w-full max-w-[240px] h-full flex items-center justify-center">
        {/* Central Document */}
        <motion.div 
          className="relative z-10 w-32 h-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-5 flex flex-col gap-3 group-hover:border-purple-500/40 transition-colors duration-700"
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1/2 h-2 bg-zinc-700 rounded-full mb-2" />
          <div className="w-full h-1.5 bg-zinc-800 rounded-full" />
          <div className="w-5/6 h-1.5 bg-zinc-800 rounded-full" />
          <div className="w-full h-1.5 bg-purple-500/40 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
          <div className="w-4/5 h-1.5 bg-zinc-800 rounded-full" />
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2" />
          <div className="w-2/3 h-1.5 bg-zinc-800 rounded-full" />
        </motion.div>

        {/* Floating Chips */}
        <motion.div 
          className="absolute z-20 top-8 right-0 bg-zinc-900/90 backdrop-blur-md border border-purple-500/30 shadow-xl rounded-full px-3 py-1.5 text-[9px] font-medium text-purple-200 flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-500"
          animate={{ y: [0, -4, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          Financial Proof
        </motion.div>

        <motion.div 
          className="absolute z-20 top-[45%] left-0 bg-zinc-900/90 backdrop-blur-md border border-blue-500/30 shadow-xl rounded-full px-3 py-1.5 text-[9px] font-medium text-blue-200 flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-500"
          animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4.5, delay: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          Travel Intent
        </motion.div>

        <motion.div 
          className="absolute z-20 bottom-10 right-4 bg-zinc-900/90 backdrop-blur-md border border-rose-500/30 shadow-xl rounded-full px-3 py-1.5 text-[9px] font-medium text-rose-200 flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-500"
          animate={{ y: [0, 4, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          Home Ties
        </motion.div>
      </div>
    </div>
  );
};

export const AppealAnimation = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />
      <div className="absolute w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors duration-1000" />
      
      <div className="relative w-full h-full flex items-center justify-center mt-6">
        {/* Back Document (Strategy) */}
        <motion.div 
          className="absolute z-10 w-36 h-48 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-xl flex flex-col px-4 py-5 gap-3 group-hover:-translate-y-8 group-hover:-translate-x-12 group-hover:rotate-[-8deg] transition-all duration-700 ease-out"
          style={{ transform: 'translate(-20px, -15px) rotate(-4deg)' }}
        >
          <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mb-1"><TrendingUp className="w-3 h-3 text-zinc-500" /></div>
          <div className="w-1/2 h-1.5 bg-zinc-700 rounded-full"></div>
          <div className="w-3/4 h-1.5 bg-zinc-800 rounded-full"></div>
        </motion.div>

        {/* Middle Document (Checklist) */}
        <motion.div 
          className="absolute z-20 w-36 h-48 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl flex flex-col px-4 py-5 gap-3 group-hover:-translate-y-6 group-hover:translate-x-12 group-hover:rotate-[8deg] transition-all duration-700 ease-out"
          style={{ transform: 'translate(20px, -8px) rotate(4deg)' }}
        >
          <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mb-1"><FileCheck2 className="w-3 h-3 text-zinc-500" /></div>
          <div className="w-1/2 h-1.5 bg-zinc-700 rounded-full"></div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full"></div>
          <div className="w-3/4 h-1.5 bg-zinc-800 rounded-full"></div>
        </motion.div>

        {/* Front Document (Visa Reapplication Submission) */}
        <motion.div 
          className="relative z-30 w-44 h-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col px-5 py-6 gap-3 group-hover:-translate-y-2 group-hover:border-emerald-500/40 group-hover:shadow-[0_30px_50px_rgba(16,185,129,0.15)] transition-all duration-700 ease-out"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
             <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="w-2/3 h-2 bg-zinc-600 rounded-full mb-1"></div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full"></div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full"></div>
          <div className="w-4/5 h-1.5 bg-zinc-800 rounded-full"></div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2"></div>
          <div className="w-3/4 h-1.5 bg-zinc-800 rounded-full"></div>

          {/* Export action hint */}
          <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-300" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

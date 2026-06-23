import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lightbulb, FileText, CheckCircle2, ChevronRight, Zap, ShieldCheck, UploadCloud, Download, FileSearch } from 'lucide-react';
import SEO from './SEO';
import { getOrganizationSchema, getWebsiteSchema, getSoftwareAppSchema, getFAQSchema } from '../utils/seoSchemas';
import TrustSection from './TrustSection';
import { ShowcaseSection } from './ShowcaseSection';
import WorldMapBackground from './WorldMapBackground';
import { UploadAnimation, AnalysisAnimation, AppealAnimation } from './HowItWorksAnimations';


interface LandingViewProps {
  onStartAppeal: () => void;
}

const HEADLINES = [
  "Know what went wrong. Fix the weaknesses. Reapply with confidence.",
  "Upload your refusal letter. Get a complete appeal and reapplication plan.",
  "From refusal letter to embassy-ready appeal package.",
  "Professional visa refusal recovery for students, workers, and travelers.",
  "Get a professional reapplication submission, document roadmap, and refusal analysis in minutes.",
  "Understand why your visa was refused — and exactly how to strengthen your next application."
];

export default function LandingView({ onStartAppeal }: LandingViewProps) {
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [typedText, setTypedText] = useState(HEADLINES[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleStartClicked = () => {
    onStartAppeal();
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentHeadline = HEADLINES[currentHeadlineIndex];
      const isComplete = typedText === currentHeadline;
      const isEmpty = typedText === '';

      if (!isDeleting && isComplete) {
        timeoutId = setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && isEmpty) {
        setIsDeleting(false);
        setCurrentHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
      } else if (isDeleting) {
        setTypedText(currentHeadline.slice(0, typedText.length - 1));
        timeoutId = setTimeout(type, 15);
      } else {
        setTypedText(currentHeadline.slice(0, typedText.length + 1));
        timeoutId = setTimeout(type, 25 + Math.random() * 30);
      }
    };

    if (typedText === '' && isDeleting) {
       timeoutId = setTimeout(type, 30);
    } else if (typedText === HEADLINES[currentHeadlineIndex] && !isDeleting) {
        // Pausing is handled by the regular type function branch
        timeoutId = setTimeout(type, 30);
    } else {
        timeoutId = setTimeout(type, 15);
    }

    return () => clearTimeout(timeoutId);
  }, [typedText, isDeleting, currentHeadlineIndex]);

  return (
    <>
      <SEO 
        title="Visa Reapplication Planning Platform | Recover from Visa Refusals" 
        description="Upload your visa refusal letter to generate an embassy-ready appeal package, personalized document checklist, and reapplication strategy using AI."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getOrganizationSchema(),
            getWebsiteSchema(),
            getSoftwareAppSchema(),
            getFAQSchema()
          ]
        }}
      />
      <div className="w-full flex flex-col bg-zinc-950">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
        {/* Background gradients and grid */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WorldMapBackground />
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-[100px] rounded-full pointer-events-none"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-5xl flex flex-col items-center z-10 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            Trusted by 1M+ Visa Applicants Worldwide
          </div>

          <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 max-w-5xl mx-auto leading-[1.1] md:leading-[1.1] lg:leading-[1.1]">
            <div className="relative w-full">
              {/* Invisible placeholder to establish max height/width reliably */}
              <div className="invisible select-none" aria-hidden="true">
                Understand why your visa was refused — and exactly how to strengthen your next application.
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-center bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/70">
                  {typedText}
                  <span className="inline-block animate-pulse w-[3px] md:w-[4px] h-[0.9em] bg-indigo-400 ml-1 rounded-sm align-middle -mt-[0.1em]" style={{ WebkitTextFillColor: 'white' }}></span>
                </span>
              </div>
            </div>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mb-12 font-medium leading-relaxed">
            Upload your visa refusal letter and receive a professional appeal package including refusal analysis, case strength assessment, personalized document recommendations, evidence roadmap, country-specific guidance, and a strategic reapplication plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleStartClicked}
              className="group flex items-center gap-3 bg-white text-zinc-950 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              Analyze My Refusal
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/sample-report"
              className="group flex items-center justify-center gap-2 bg-transparent text-white border border-zinc-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-900 transition-all"
            >
              <FileSearch className="w-5 h-5" />
              View Sample Report
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">How it works</h2>
            <p className="text-zinc-400 text-lg">A simple 3-step process to strengthen your case.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Card 1 */}
            <div className="group bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 flex flex-col h-[400px]">
               <div className="h-[280px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center relative border-b border-zinc-800/50">
                  <UploadAnimation />
               </div>
               <div className="px-8 pb-8 pt-6 flex-1 flex flex-col bg-zinc-900/40 z-10 relative">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">1. Upload your refusal</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Securely drop your official rejection document. Our system instantly parses and verifies it.</p>
               </div>
            </div>
            
            {/* Card 2 */}
            <div className="group bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 flex flex-col h-[400px]">
               <div className="h-[280px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center relative border-b border-zinc-800/50">
                  <AnalysisAnimation />
               </div>
               <div className="px-8 pb-8 pt-6 flex-1 flex flex-col bg-zinc-900/40 z-10 relative">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">2. AI analysis</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Our intelligence engine isolates the exact legal triggers that caused your rejection.</p>
               </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 flex flex-col h-[400px]">
               <div className="h-[280px] w-full overflow-hidden bg-zinc-950 flex items-end justify-center relative border-b border-zinc-800/50">
                  <AppealAnimation />
               </div>
               <div className="px-8 pb-8 pt-6 flex-1 flex flex-col bg-zinc-900/40 z-10 relative">
                   <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">3. Get your reapplication package</h3>
                   <p className="text-zinc-500 text-sm leading-relaxed">Download a complete, embassy-ready package structured to maximize approval odds.</p>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-zinc-900/30 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Structured, practical, and usable immediately.</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 bg-zinc-800/50 p-2 rounded-lg h-fit"><FileText className="w-5 h-5 text-indigo-400" /></div>
                <div>
                   <h4 className="font-semibold text-lg mb-1">Embassy-ready reapplication submission</h4>
                   <p className="text-zinc-400 text-sm">Formal, structured, and specifically addressing the refusal grounds. No generic AI fluff.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-zinc-800/50 p-2 rounded-lg h-fit"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Personalized document checklist</h4>
                  <p className="text-zinc-400 text-sm">Stop guessing. Get a precise list of required, recommended, and optional strengthening documents.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-zinc-800/50 p-2 rounded-lg h-fit"><Lightbulb className="w-5 h-5 text-amber-400" /></div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Reapplication improvement plan</h4>
                  <p className="text-zinc-400 text-sm">Understand what went wrong, what to fix, and what NOT to do in your next application.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[650px] w-full flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 rounded-full blur-[120px] opacity-70"></div>
             
             <motion.div 
               className="relative z-10 w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] hover:border-indigo-500/30 transition-all duration-700"
               animate={{ y: [0, -8, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             >
                {/* Glow accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80"></div>
                
                {/* Ambient glow inside card */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-zinc-800/80 relative">
                   <div className="flex justify-between items-start mb-2">
                      <h5 className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase flex items-center gap-2">
                         <ShieldCheck className="w-3.5 h-3.5" />
                         Visa Reapplication Preparation Package
                      </h5>
                      <span className="flex h-2 w-2 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                   </div>
                   <h3 className="text-2xl font-semibold text-white tracking-tight">Your Premium Case</h3>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-7 relative">
                   {/* Case Summary */}
                   <div className="space-y-4">
                      <h6 className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-2">
                         <Zap className="w-3.5 h-3.5" /> Case Summary
                      </h6>
                      <div className="space-y-3">
                          <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <span className="text-sm text-zinc-300 font-medium leading-relaxed">Primary Refusal Ground Identified</span>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <span className="text-sm text-zinc-300 font-medium leading-relaxed">Supporting Evidence Mapped</span>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <span className="text-sm text-zinc-300 font-medium leading-relaxed">Reapplication Strategy Generated</span>
                          </div>
                      </div>
                   </div>

                   {/* Included Documents */}
                   <div className="space-y-4 pt-5 border-t border-zinc-800/80">
                      <h6 className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-2">
                         <FileText className="w-3.5 h-3.5" /> Included Documents
                      </h6>
                      <div className="space-y-2">
                          <div className="flex items-center gap-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/50 hover:border-indigo-500/30 transition-colors p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                 <FileText className="w-4 h-4 text-indigo-400" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium">Visa Reapplication Submission</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/60 ml-auto shrink-0" />
                          </div>
                          <div className="flex items-center gap-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/50 hover:border-purple-500/30 transition-colors p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                 <CheckCircle2 className="w-4 h-4 text-purple-400" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium">Personalized Evidence Checklist</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/60 ml-auto shrink-0" />
                          </div>
                          <div className="flex items-center gap-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/50 hover:border-amber-500/30 transition-colors p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                 <FileText className="w-4 h-4 text-amber-400" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium">Supporting Documents Guide</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/60 ml-auto shrink-0" />
                          </div>
                          <div className="flex items-center gap-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/50 hover:border-rose-500/30 transition-colors p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                 <Lightbulb className="w-4 h-4 text-rose-400" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium">Reapplication Action Plan</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/60 ml-auto shrink-0" />
                          </div>
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
                   <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Package Quality Score</span>
                       <div className="flex items-center gap-3">
                           <div className="h-1.5 w-20 bg-zinc-800 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-400 w-[94%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                           </div>
                           <span className="text-sm font-bold text-emerald-400">94 / 100</span>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20 px-3 py-1.5 rounded-full cursor-default group">
                       <Download className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-y-0.5 transition-transform" />
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Ready For Export</span>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 tracking-tight">Used by applicants worldwide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left">
              <div className="flex gap-1 text-emerald-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-zinc-300 italic mb-6">"Got my visa approved after reapplying using this appeal. The structure was perfect."</p>
              <p className="text-sm font-semibold">— User (Canada Tourist Visa)</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left">
              <div className="flex gap-1 text-emerald-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-zinc-300 italic mb-6">"Better than agents. Fast, structured, and explained exactly what documents I was missing."</p>
              <p className="text-sm font-semibold">— Student (UK Tier 4)</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left">
               <div className="flex gap-1 text-emerald-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-zinc-300 italic mb-6">"Saved me weeks of confusion. The 'What NOT to do' section was incredibly eye-opening."</p>
              <p className="text-sm font-semibold">— Traveler (Schengen Visa)</p>
            </div>
          </div>
        </div>
      </section>

      <ShowcaseSection />

        <TrustSection />

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-zinc-900/30 border-t border-zinc-900">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-zinc-400 text-lg mb-8">Choose the tier that fits your needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">$9.99</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Document Draft</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Basic Checklist</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> PDF Export</li>
              </ul>
              <button onClick={handleStartClicked} className="w-full py-3 rounded-full border border-zinc-700 font-medium hover:bg-zinc-800 transition-colors">Select Starter</button>
            </div>

            {/* Standard */}
            <div className="bg-zinc-900 border border-indigo-500 rounded-3xl p-6 flex flex-col relative shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded-full whitespace-nowrap">Most Popular</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Standard</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$19.99</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Everything in Starter</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Readiness Score</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Reapplication Planner</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Country-Specific Recommendations</li>
                <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Embassy-Ready Formatting</li>
              </ul>
              <button 
                onClick={handleStartClicked}
                className="w-full py-3 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors mt-auto"
              >
                Generate Now
              </button>
            </div>

            {/* Premium */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">$34.99</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Everything in Standard</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Detailed Refusal Analysis</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Evidence Roadmap</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Weakness Analysis</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Readiness Outlook Report</li>
                <li className="flex items-start gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Complete Premium PDF Package</li>
              </ul>
              <button onClick={handleStartClicked} className="w-full py-3 rounded-full border border-zinc-700 font-medium hover:bg-zinc-800 transition-colors mt-auto">Select Premium</button>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/sample-report"
              className="inline-flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <FileSearch className="w-5 h-5" />
              See exactly what you get: View a Sample Report
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-zinc-950 border-t border-zinc-900 border-b">
         <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <h4 className="text-lg font-semibold mb-2">Is this legally guaranteed?</h4>
              <p className="text-zinc-400 text-sm">No, this is a document preparation tool. The final decision always rests with the respective consular officer. We provide structuring based on best practices.</p>
            </div>
            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <h4 className="text-lg font-semibold mb-2">Does it work for all countries?</h4>
              <p className="text-zinc-400 text-sm">Yes, our engine utilizes country-specific formatting logic adaptable to major embassy requirements (Schengen, US, UK, Canada, Australia).</p>
            </div>
            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <h4 className="text-lg font-semibold mb-2">Is my data stored?</h4>
              <p className="text-zinc-400 text-sm">We employ minimal storage with secure processing. Uploaded refusal documents are analyzed securely and are not used to train generic models.</p>
            </div>
             <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <h4 className="text-lg font-semibold mb-2">Can I reuse this for multiple applications?</h4>
              <p className="text-zinc-400 text-sm">Yes, you can generate fresh appeals with new inputs as needed based on your selected pricing tier.</p>
            </div>
          </div>
         </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to fix your application?</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
              onClick={handleStartClicked}
              className="bg-white text-zinc-950 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
            >
              Generate My Appeal
          </button>
          <Link
            to="/sample-report"
            className="flex items-center justify-center gap-2 bg-transparent text-white border border-zinc-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <FileSearch className="w-5 h-5" />
            View Sample Report
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}

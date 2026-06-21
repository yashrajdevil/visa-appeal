import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Copy, CheckCircle2, ChevronLeft, LockIcon, AlertCircle, Briefcase, FileText, CheckSquare, Clock, ShieldCheck, Zap } from 'lucide-react';
import { GenerateAppealResponse, ChecklistItem } from '../types';
import { generateAppeal } from '../services/api'; // just for example if needed later
import { auth, db } from '../firebase';
import SEO from './SEO';

interface ResultsDashboardProps {
  result: GenerateAppealResponse;
  onReset: () => void;
  isSample?: boolean;
  initialPlan?: PlanTier;
}

type PlanTier = 'free' | 'starter' | 'standard' | 'premium';

export default function ResultsDashboard({ result, onReset, isSample = false, initialPlan = 'free' }: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  
  const activePlan = isSample ? 'premium' : initialPlan;

  const isStarter = isSample || activePlan === 'starter' || activePlan === 'standard' || activePlan === 'premium';
  const isStandard = isSample || activePlan === 'standard' || activePlan === 'premium';
  const isPremium = isSample || activePlan === 'premium';

  const handleCopy = () => {
    if (!isStarter) {
      alert('Please unlock the full package to copy the supporting explanation.');
      return;
    }
    navigator.clipboard.writeText(result.appeal_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!isStarter) {
      alert('Please unlock the full package to download.');
      return;
    }
    
    if (pdfContentRef.current) {
      const element = pdfContentRef.current;
      // Temporarily make the hidden PDF content visible for printing
      element.style.display = 'block';
      
      const opt = {
        margin:       [0.5, 0] as [number, number],
        filename:     'Visa_Appeal_Package.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };

      try {
        const { default: html2canvas } = await import('html2canvas');
        const { jsPDF } = await import('jspdf');
        
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF({ unit: 'in', format: 'a4', orientation: 'portrait' });
        
        // standard a4 width in inches
        const pdfWidth = 8.27;
        const pdfHeight = 11.69;
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / pdfWidth;
        const computedHeight = imgHeight / ratio;

        let heightLeft = computedHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, computedHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - computedHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, computedHeight);
          heightLeft -= pdfHeight;
        }

        const pdfBlob = pdf.output('blob');
        const fileName = `Visa_Appeal_Package_${Date.now()}.pdf`;
        let pdfUrl = '';

        if (auth.currentUser && result.caseId) {
          try {
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const { doc, updateDoc } = await import('firebase/firestore');
            const storage = getStorage();
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/cases/${result.caseId}/${fileName}`);
            await uploadBytes(storageRef, pdfBlob);
            pdfUrl = await getDownloadURL(storageRef);
            
            const caseRef = doc(db, 'users', auth.currentUser.uid, 'cases', result.caseId);
            
            const updateField = activePlan === 'premium' ? 'pdfUrls.premium' : 
                               activePlan === 'standard' ? 'pdfUrls.standard' : 'pdfUrls.starter';
                               
            await updateDoc(caseRef, {
              [updateField]: pdfUrl
            });
          } catch(uploadErr) {
             console.error("Failed to upload PDF:", uploadErr);
          }
        }

        pdf.save('Visa_Appeal_Package.pdf');
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert("An error occurred while generating the PDF. Please try again or use the Copy button to save your content in the meantime.");
      } finally {
        element.style.display = 'none';
      }
    }
  };

  const handlePayment = async (plan: PlanTier) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      if (!token) {
        alert("Please log in to upgrade.");
        return;
      }
      
      let finalCaseId = result.caseId;
      
      console.log(`Starting checkout with caseId: ${finalCaseId}`);

      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan, caseId: finalCaseId })
      });
      
      if (!res.ok) {
        console.error("Failed response:", await res.text());
        throw new Error("Failed to create checkout");
      }
      
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout. Please try again later.");
    }
  };

  const scoreColor = 
    result.case_assessment.severityRating === 'Strong' ? 'text-emerald-400' : 
    result.case_assessment.severityRating === 'Moderate' ? 'text-blue-400' :
    result.case_assessment.severityRating === 'High Risk' ? 'text-amber-400' : 'text-rose-400';

  const severityBadgeColor = 
    result.case_assessment.severityRating === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
    result.case_assessment.severityRating === 'High Risk' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
    result.case_assessment.severityRating === 'Moderate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  const renderChecklistSection = (title: string, items: ChecklistItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8">
        <h4 className="text-sm text-zinc-400 uppercase tracking-widest font-semibold mb-4 ml-1">{title}</h4>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-4 border-b border-zinc-800/80 group">
              <div className="mt-0.5 w-5 h-5 flex-shrink-0 border-2 border-zinc-700 rounded bg-zinc-900 group-hover:border-zinc-500 transition-colors" />
              <div>
                <span className="text-base text-zinc-200 block mb-1 font-medium">{item.item}</span>
                <span className="text-sm text-zinc-400 block">{item.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="Appeal Results | Visa Reapplication Planning Platform" description="" noindex={true} />
      <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full relative z-10 flex flex-col">
      <div className="flex items-start sm:items-center justify-between mb-12 flex-col sm:flex-row gap-6">
        <div>
          <button 
            onClick={onReset}
            className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> {isSample ? 'Back to Previous' : 'Start New Analysis'}
          </button>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-2">Reapplication Preparation Package</h2>
          {!isSample && (
            activePlan === 'free' ? (
              <p className="text-indigo-400 flex items-center gap-1.5"><LockIcon className="w-4 h-4" /> Preview Mode — Unlock for full export</p>
            ) : (
              <p className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> <span className="capitalize">{activePlan}</span> Package Unlocked</p>
            )
          )}
        </div>
        
        <div className="flex z-20 items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleCopy}
            className="flex-1 sm:flex-none items-center justify-center flex gap-1.5 px-4 py-2 text-sm font-medium bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 sm:flex-none items-center justify-center flex gap-1.5 px-6 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {/* SECTION 1 - CONSULTANT REVIEW */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Case Assessment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score & Severity */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-start shadow-lg overflow-hidden relative">
              {!isStandard && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-4 text-center">
                  <LockIcon className="w-6 h-6 text-indigo-400 mb-2" />
                  <p className="text-sm text-zinc-300 font-medium mb-3">Upgrade to Standard<br/>to unlock Case Readiness Score</p>
                  <button type="button" onClick={(e) => { e.preventDefault(); handlePayment('standard'); }} className="text-xs px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-full transition-colors">Unlock</button>
                </div>
              )}
              <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2 font-medium">Application Readiness Score</div>
              <div className={`text-5xl font-bold ${scoreColor} mb-4`}>
                {result.case_assessment.score}<span className="text-2xl text-zinc-600 font-medium">/100</span>
              </div>
              
              <div className="w-full pt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Severity Rating</div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${severityBadgeColor}`}>
                  {result.case_assessment.severityRating}
                </div>
              </div>
              <div className="w-full pt-4 mt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Case Type</div>
                <div className="text-sm text-zinc-300 font-medium">{result.case_assessment.caseType}</div>
              </div>
            </div>
            
            {/* AI Assessment Summary & Notes */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Verdict & Path */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Briefcase className="w-32 h-32" />
                </div>
                <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-zinc-800/80 relative z-10">
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Current Case Strength</div>
                    <div className="text-lg text-white font-medium mb-1">
                      {result.case_assessment.consultantVerdict.currentCaseStrength}
                    </div>
                    <div className="text-xs text-zinc-400">Confidence: <span className="text-emerald-400">{result.case_assessment.consultantVerdict.confidenceLevel}</span></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Recommended Path</div>
                    <div className="text-lg text-indigo-400 font-medium">{result.case_assessment.consultantVerdict.recommendedPath}</div>
                  </div>
                </div>

                <div className="mb-6 relative z-10 overflow-hidden">
                  {!isPremium && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-4 text-center">
                       <LockIcon className="w-5 h-5 text-purple-400 mb-2" />
                       <p className="text-sm text-zinc-200 mb-2">Upgrade to Premium to unlock<br/><span className="text-purple-400 font-medium">Enhanced AI Assessment Summary</span></p>
                       <button type="button" onClick={(e) => { e.preventDefault(); handlePayment('premium'); }} className="text-xs px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-full transition-colors">Unlock Premium</button>
                    </div>
                  )}
                  <div className={`transition-opacity ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Consultant Reasoning:</div>
                    </div>
                    <p className="text-sm text-zinc-300 italic mb-6">
                       "{result.case_assessment.consultantVerdict.reasoning}"
                    </p>

                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Consultant Notes</h4>
                    <ul className="space-y-3 mb-6">
                        {result.case_assessment.consultantNotes.map((note, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                            <span className="leading-relaxed">{note}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                
                {result.case_assessment.successOutlook && (
                  <div className="pt-6 border-t border-zinc-800/80 relative z-10 overflow-hidden">
                    {!isPremium && (
                      <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-4 text-center">
                         <LockIcon className="w-5 h-5 text-purple-400 mb-2" />
                         <p className="text-sm text-zinc-200 mb-2">Upgrade to Premium to unlock<br/><span className="text-purple-400 font-medium">Readiness Outlook & Weakness Analysis</span></p>
                         <button type="button" onClick={(e) => { e.stopPropagation(); alert('Top Premium Button Clicked'); handlePayment('premium'); }} className="text-xs px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-full transition-colors">Unlock Premium</button>
                      </div>
                    )}
                    <div className={`transition-opacity ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                      <div className="flex flex-col sm:flex-row gap-6">
                         <div className="flex-1">
                           <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Post-Fixes Outlook</div>
                           <div className="text-emerald-400 font-medium">{result.case_assessment.successOutlook.readinessAfterFixes}</div>
                         </div>
                         <div className="flex-1">
                           <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Exp. Improvement</div>
                           <div className="text-indigo-400 font-medium">{result.case_assessment.successOutlook.expectedScoreImprovement}</div>
                         </div>
                      </div>
                      {result.case_assessment.successOutlook.primaryObstacles && result.case_assessment.successOutlook.primaryObstacles.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Primary Obstacles to Address</div>
                          <div className="flex flex-wrap gap-2">
                            {result.case_assessment.successOutlook.primaryObstacles.map((obs, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20">{obs}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ISSUE BREAKDOWN FORMAT */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Refusal Issue Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.issues.map((issue, idx) => (
              <div key={idx} className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-semibold text-white">{issue.issue}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    issue.impact === 'Critical' || issue.impact === 'High' ? 'bg-rose-500/10 text-rose-400' :
                    issue.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {issue.impact} Impact
                  </span>
                </div>
                
                <div className="relative mt-4">
                  {!isPremium && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-4 text-center rounded-lg border border-zinc-800">
                       <LockIcon className="w-5 h-5 text-purple-400 mb-2" />
                       <p className="text-xs text-zinc-300 mb-3">Upgrade to Premium for Detailed Breakdown & Evidence Roadmap</p>
                       <button type="button" onClick={(e) => { e.preventDefault(); handlePayment('premium'); }} className="text-xs px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-full transition-colors">Unlock Premium</button>
                    </div>
                  )}
                  <div className={`transition-opacity ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                    <div className="mb-4 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Finding</div>
                      <div className="text-sm text-zinc-300">{issue.finding}</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Recommended Action</div>
                      <div className="text-sm text-indigo-300 font-medium">{issue.recommendedAction}</div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Required Evidence</div>
                      <ul className="space-y-1.5">
                        {issue.recommendedEvidence.map((ev, i) => (
                          <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 - APPEAL LETTER DOCUMENT VIEWER */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Supporting Explanation Draft</h3>
          </div>
          
          <div className="relative">
             <div className="bg-zinc-800/30 -mx-4 sm:-mx-8 p-4 sm:p-8 rounded-3xl border border-zinc-800/50 shadow-inner overflow-x-auto flex flex-col items-center pb-24">
               
               {/* Viewer Header Toolbar */}
               <div className="mb-4 w-full max-w-[800px] flex justify-between items-center bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-700/50 shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-indigo-500/10 rounded-md">
                        <FileText className="w-4 h-4 text-indigo-400" />
                     </div>
                     <span className="text-sm font-medium text-zinc-200 tracking-wide">formal_supporting_explanation_draft.docx</span>
                  </div>
                  <div className="flex gap-1.5 opacity-50">
                     <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                     <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                     <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                  </div>
               </div>

               {/* A4 Document Canvas */}
               <div 
                 className="relative bg-white shrink-0 shadow-2xl rounded-sm py-16 px-10 sm:py-24 sm:px-16"
                 style={{ 
                   width: '100%',
                   maxWidth: '800px',
                   minHeight: '1050px'
                 }}
               >
                 <div className="max-w-[650px] mx-auto w-full relative z-10 text-black">
                    <div className="whitespace-pre-wrap font-serif text-[15px] leading-[1.8] text-[#1a1a1a] tracking-normal text-justify">
                      {isStarter ? (
                        <div className="outline-none focus:ring-2 ring-indigo-500/20 rounded-md p-2 -m-2 transition-all" contentEditable suppressContentEditableWarning>
                           {result.appeal_letter}
                        </div>
                      ) : (
                        <>
                          <div>{result.appeal_letter.slice(0, 300)}...</div>
                          <div className="mt-4 blur-[4px] opacity-40 select-none">
                            {result.appeal_letter.slice(300, 1500)}
                            <br/><br/>
                            [Letter continues securely...]
                          </div>
                        </>
                      )}
                    </div>
                 </div>

                 {/* Paywall Overlay inside the letter canvas */}
                 {!isStarter && (
                   <div className="absolute inset-x-0 bottom-0 top-[200px] z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-[4px]">
                     <div className="w-full max-w-md bg-zinc-950 p-8 rounded-3xl shadow-2xl border border-zinc-800 mt-32 text-left">
                       <div className="text-center mb-8">
                          <LockIcon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Unlock Application Package</h3>
                          <p className="text-sm text-zinc-400">Choose a plan to generate your full appeal package.</p>
                       </div>

                       <div className="space-y-4">
                         {/* Starter Plan */}
                         <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); handlePayment('starter'); }}>
                            <div>
                               <div className="font-semibold text-white mb-1">Starter</div>
                               <div className="text-xs text-zinc-400">Document Draft + Basic Checklist</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white tracking-tight">$9.99</div>
                              <button className="mt-1 text-[10px] px-3 py-1 bg-white text-zinc-950 font-semibold uppercase tracking-wide rounded-full">Unlock</button>
                            </div>
                         </div>

                         {/* Standard Plan */}
                         <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors cursor-pointer relative" onClick={(e) => { e.preventDefault(); handlePayment('standard'); }}>
                            <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-indigo-500 text-white text-[9px] uppercase font-bold tracking-wider rounded-sm">Recommended</div>
                            <div>
                               <div className="font-semibold text-white mb-1">Standard</div>
                               <div className="text-xs text-zinc-400">Reapplication Strategy + Score</div>
                            </div>
                            <div className="text-right flex flex-col justify-center items-end">
                              <div className="font-bold text-white tracking-tight">$19.99</div>
                              <button className="mt-1 text-[10px] px-3 py-1 bg-indigo-500 text-white font-semibold uppercase tracking-wide rounded-full">Unlock</button>
                            </div>
                         </div>
                         {/* Premium Plan */}
                         <div className="flex items-center justify-between p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); handlePayment('premium'); }}>
                            <div>
                               <div className="font-semibold text-white mb-1">Premium</div>
                               <div className="text-xs text-zinc-400">Detailed Breakdown + AI Assessment Summary</div>
                            </div>
                            <div className="text-right flex flex-col justify-center items-end">
                              <div className="font-bold text-white tracking-tight">$34.99</div>
                              <button className="mt-1 text-[10px] px-3 py-1 bg-purple-500 text-white font-semibold uppercase tracking-wide rounded-full">Unlock</button>
                            </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </section>

        {/* REAPPLICATION STRATEGY */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">Reapplication Strategy Planner</h3>
          </div>
          <div className="relative">
            {!isStandard && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-zinc-800">
                 <LockIcon className="w-6 h-6 text-indigo-400 mb-3" />
                 <h4 className="text-lg font-bold text-white mb-2">Upgrade to Standard</h4>
                 <p className="text-sm text-zinc-300 mb-4">Unlock personalized Reapplication Strategy.</p>
                 <button type="button" onClick={(e) => { e.preventDefault(); handlePayment('standard'); }} className="text-sm px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full transition-colors shadow-lg">Unlock Standard ($19.99)</button>
              </div>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!isStandard ? 'blur-sm opacity-40 select-none' : ''}`}>
             <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">Immediate Actions</h4>
                <ul className="space-y-3">
                  {result.strategy.immediateActions.map((action, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
             </div>
             
             <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">Evidence To Gather</h4>
                <ul className="space-y-3">
                  {result.strategy.evidenceToGather.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">Common Mistakes To Avoid</h4>
                <ul className="space-y-3">
                  {result.strategy.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-zinc-800/20 border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-center text-center">
                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Recommended Timeline</h4>
                <div className="text-lg font-medium text-white mb-4">{result.strategy.timeline}</div>
                
                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold pt-4 border-t border-zinc-800">Expected Outcome</h4>
                <div className="text-sm text-emerald-400 font-medium">{result.strategy.expectedOutcome}</div>
             </div>
          </div>
          </div>
        </section>

         {/* DOCUMENT CHECKLIST */}
        <section className="pb-16 border-t border-zinc-800/80 pt-12">
          <div className="flex items-center gap-2 mb-8">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-medium text-white">{isStandard ? 'Detailed Categorized Checklist' : 'Basic Document Checklist'}</h3>
          </div>
          
          <div className="max-w-3xl relative z-10">
            {renderChecklistSection('Identity Documents', result.checklist.identity)}
            {renderChecklistSection('Travel Documents', result.checklist.travel)}
            
            {/* Standard Tier Checklist Expansion */}
            <div className="relative mt-8">
              {!isStandard && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center border border-zinc-800 rounded-xl">
                   <LockIcon className="w-6 h-6 text-indigo-400 mb-3" />
                   <h4 className="text-lg font-bold text-white mb-2">Detailed Checklist Locked</h4>
                   <p className="text-sm text-zinc-300 mb-4">Upgrade to Standard for Financial, Employment, and Academic checks.</p>
                   <button type="button" onClick={(e) => { e.preventDefault(); handlePayment('standard'); }} className="text-sm px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full transition-colors shadow-lg">Unlock Standard ($19.99)</button>
                </div>
              )}
              <div className={`transition-opacity ${!isStandard ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                {renderChecklistSection('Financial Documents', result.checklist.financial)}
                {renderChecklistSection('Employment Documents', result.checklist.employment)}
                {renderChecklistSection('Academic Documents', result.checklist.academic)}
                {renderChecklistSection('Other Documents', result.checklist.other)}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Disclaimer on Dashboard */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-500">
          <strong>Disclaimer:</strong> This platform provides document preparation and informational assistance only. It does not provide immigration advice, legal advice, or representation before any government authority.
        </div>
      </div>

      {/* Hidden PDF Export Template */}
      <div style={{ display: 'none' }}>
        <div ref={pdfContentRef} className="bg-white text-black" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
          
          {/* PDF Page 1: Cover Page */}
          <div style={{ padding: '60px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '1000px', pageBreakAfter: 'always' }}>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
               <h1 style={{ fontSize: '42px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-1px', color: '#111' }}>Visa Reapplication Preparation Package</h1>
               <p style={{ fontSize: '20px', color: '#555', margin: '0 0 40px 0', fontWeight: '500' }}>Professional Consultant Case Assessment & Submission</p>
               <div style={{ borderTop: '3px solid #111', width: '80px', margin: '0 auto 40px auto' }}></div>
               
               <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', margin: '0 auto 40px auto', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                 <div style={{ fontSize: '13px', textTransform: 'uppercase', color: '#666', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>Application Readiness Score</div>
                 <div style={{ fontSize: '56px', fontWeight: '800', color: result.case_assessment.score > 79 ? '#10b981' : result.case_assessment.score > 59 ? '#3b82f6' : result.case_assessment.score > 39 ? '#f59e0b' : '#ef4444', lineHeight: '1' }}>{result.case_assessment.score}<span style={{ fontSize: '24px', color: '#888' }}>/100</span></div>
                 <div style={{ marginTop: '16px', display: 'inline-block', padding: '6px 12px', backgroundColor: '#111', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>SEVERITY: {result.case_assessment.severityRating}</div>
               </div>

               <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <p style={{ fontSize: '16px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Applicant Name</p>
                 <p style={{ fontSize: '24px', color: '#111', fontWeight: '700', margin: '0 0 24px 0' }}>{result.case_assessment.applicantName || 'Confidential Client'}</p>
                 
                 <p style={{ fontSize: '16px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Visa Type / Case Context</p>
                 <p style={{ fontSize: '20px', color: '#111', fontWeight: '600', margin: '0 0 0 0' }}>{result.case_assessment.caseType}</p>
               </div>
             </div>
             
             <div style={{ textAlign: 'center', marginTop: 'auto', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
               <p style={{ fontSize: '12px', color: '#888', fontWeight: '500', marginBottom: '4px' }}><strong>Disclaimer:</strong> This document provides structural preparation assistance only. It does not constitute immigration or legal advice.</p>
               <p style={{ fontSize: '14px', color: '#888', fontWeight: '500', margin: 0 }}>Generated Date: {new Date().toLocaleDateString()} | Strictly Confidential</p>
             </div>
          </div>

          {/* PDF Page 2: Executive Summary */}
          <div style={{ padding: '60px 80px', boxSizing: 'border-box', pageBreakAfter: 'always' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '800', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>Executive Summary</h2>
             
             {/* Most Prominent Section: AI Assessment Summary */}
             <div style={{ marginBottom: '32px', backgroundColor: '#111', color: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', pageBreakInside: 'avoid' }}>
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#a1a1aa', fontWeight: '700', marginBottom: '24px' }}>AI Assessment Summary</h3>
                
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: '600', marginBottom: '8px' }}>Recommended Path</div>
                     <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{result.case_assessment.consultantVerdict.recommendedPath}</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: '600', marginBottom: '8px' }}>Case Strength</div>
                     <div style={{ fontSize: '20px', fontWeight: '700', color: result.case_assessment.score > 79 ? '#34d399' : result.case_assessment.score > 59 ? '#60a5fa' : result.case_assessment.score > 39 ? '#fbbf24' : '#f87171' }}>{result.case_assessment.consultantVerdict.currentCaseStrength}</div>
                  </div>
                </div>
                
                <div>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: '600', marginBottom: '8px' }}>Consultant Reasoning</div>
                   <p style={{ fontSize: '15px', margin: 0, color: '#e4e4e7', fontStyle: 'italic', lineHeight: '1.6' }}>"{result.case_assessment.consultantVerdict.reasoning}"</p>
                </div>
             </div>

             <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: '#111', pageBreakInside: 'avoid' }}>Readiness Outlook</h3>
             <div style={{ marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'stretch', pageBreakInside: 'avoid' }}>
                <div style={{ flex: 1, border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: '700', marginBottom: '8px' }}>Current Readiness</div>
                   <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>{result.case_assessment.successOutlook?.currentReadiness || 'Low'}</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: '700', marginBottom: '8px' }}>Post-Fixes Outlook</div>
                   <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{result.case_assessment.successOutlook?.readinessAfterFixes || 'Strong'}</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: '700', marginBottom: '8px' }}>Pot. Score Improvement</div>
                   <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>{result.case_assessment.successOutlook?.expectedScoreImprovement || '+20 Points'}</div>
                </div>
             </div>
             
             {result.case_assessment.successOutlook?.primaryObstacles && result.case_assessment.successOutlook.primaryObstacles.length > 0 && (
               <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
                 <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#ef4444', marginBottom: '12px' }}>Primary Obstacles to Address</h4>
                 <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.6' }}>
                   {result.case_assessment.successOutlook.primaryObstacles.map((obs, i) => <li key={i}>{obs}</li>)}
                 </ul>
               </div>
             )}

             <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: '#111', pageBreakInside: 'avoid' }}>Main Refusal Issues</h3>
             <ul style={{ paddingLeft: '20px', marginBottom: '32px', pageBreakInside: 'avoid' }}>
               {result.issues.map((issue, i) => (
                 <li key={i} style={{ fontSize: '15px', color: '#333', marginBottom: '12px', lineHeight: '1.5' }}>
                   <strong>{issue.issue}</strong>
                   <span style={{ display: 'inline-block', backgroundColor: issue.impact === 'Critical' || issue.impact === 'High' ? '#fee2e2' : '#fef3c7', color: issue.impact === 'Critical' || issue.impact === 'High' ? '#991b1b' : '#92400e', fontWeight: '700', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                     {issue.impact} Risk
                   </span>
                 </li>
               ))}
             </ul>

             <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: '#111', pageBreakInside: 'avoid' }}>Top Required Actions</h3>
             <ul style={{ paddingLeft: '20px', marginBottom: '20px', pageBreakInside: 'avoid' }}>
               {result.strategy.immediateActions.map((action, i) => (
                 <li key={i} style={{ fontSize: '14px', color: '#333', marginBottom: '12px', lineHeight: '1.6' }}>{action}</li>
               ))}
             </ul>
          </div>

          {/* PDF Page 3: Issue Analysis */}
          <div style={{ padding: '60px 80px', boxSizing: 'border-box' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '800', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>Refusal Issue Analysis</h2>
             
             {result.issues.map((issue, idx) => (
               <div key={idx} style={{ marginBottom: '32px', backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', pageBreakInside: 'avoid' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#111' }}>{issue.issue}</h4>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', backgroundColor: issue.impact === 'Critical' ? '#fee2e2' : issue.impact === 'High' ? '#ffedd5' : '#dcfce7', color: issue.impact === 'Critical' ? '#991b1b' : issue.impact === 'High' ? '#9a3412' : '#166534', borderRadius: '20px', textTransform: 'uppercase' }}>{issue.impact}</span>
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', marginBottom: '6px' }}>Consultant Finding</div>
                   <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{issue.finding}</div>
                 </div>

                 <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#3b82f6', fontWeight: '700', marginBottom: '6px' }}>Recommended Resolution</div>
                   <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: '600', lineHeight: '1.5' }}>{issue.recommendedAction}</div>
                 </div>

                 <div>
                   <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', marginBottom: '8px' }}>Mandatory Evidence</div>
                   <ul style={{ paddingLeft: '20px', margin: 0 }}>
                     {issue.recommendedEvidence.map((ev, i) => (
                       <li key={i} style={{ fontSize: '14px', color: '#4b5563', marginBottom: '6px', lineHeight: '1.5' }}>{ev}</li>
                     ))}
                   </ul>
                 </div>
               </div>
             ))}
          </div>

          {/* PDF Page 4: Appeal Letter */}
          <div style={{ padding: '60px 80px', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>Draft Preparation Submission (Supporting Explanation)</h2>
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: "'Times New Roman', Times, serif", fontSize: '15px', lineHeight: '1.8', color: '#111', textJustify: 'inter-word', textAlign: 'justify', padding: '40px', border: '1px solid #e5e7eb', backgroundColor: '#fafafa', borderRadius: '4px' }}>
              {result.appeal_letter}
            </div>
          </div>
          
          {/* PDF Page 5: Checklist & Strategy */}
          <div style={{ padding: '60px 80px', boxSizing: 'border-box' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '800', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>Evidence Checklist & Strategy</h2>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px', pageBreakInside: 'avoid' }}>
               <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px', color: '#0f172a' }}>Immediate Strategy Actions</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                    {result.strategy.immediateActions.map((action, i) => <li key={i} style={{ marginBottom: '8px' }}>{action}</li>)}
                  </ul>
               </div>

               <div>
                 <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: '#64748b' }}>Target Timeline</h4>
                    <p style={{ fontSize: '16px', margin: 0, fontWeight: '600', color: '#0f172a' }}>{result.strategy.timeline}</p>
                 </div>
                 <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: '#64748b' }}>Expected Outcome</h4>
                    <p style={{ fontSize: '16px', margin: 0, fontWeight: '600', color: '#059669' }}>{result.strategy.expectedOutcome}</p>
                 </div>
               </div>
             </div>

             <h3 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', color: '#111' }}>Structured Document Checklist</h3>

             {['Financial', 'Employment', 'Academic', 'Travel', 'Identity', 'Other'].map(category => {
               const catKey = category.toLowerCase() as keyof ChecklistItem;
               // @ts-ignore dynamic access for PDF template
               const items = result.checklist[catKey];
               if (!items || items.length === 0) return null;
               
               return (
                 <div key={category} style={{ marginBottom: '24px', pageBreakInside: 'avoid', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                   <h4 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px', color: '#334155', display: 'inline-block', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px' }}>{category} Evidence</h4>
                   {items.map((item: any, i: number) => (
                     <div key={i} style={{ display: 'flex', marginBottom: '12px', alignItems: 'flex-start' }}>
                       <div style={{ fontSize: '20px', marginRight: '16px', color: '#94a3b8', lineHeight: '1' }}>☐</div>
                       <div>
                         <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{item.item}</div>
                         <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{item.explanation}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               );
             })}
          </div>

        </div>
      </div>
      
    </div>
    </>
  );
}

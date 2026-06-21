import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FileText, ChevronRight, X, Check, Edit2, 
  Plus, AlertCircle, ShieldCheck, Briefcase, 
  MapPin, Globe, User, Save
} from 'lucide-react';
import { AppealFormData, ExternalQuestionResponse } from '../types';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface CaseWizardProps {
  onSubmit: (data: AppealFormData) => void;
}

const COUNTRY_OPTIONS = [
  'Canada', 'United States', 'United Kingdom', 'Schengen Area', 
  'Australia', 'New Zealand', 'Singapore', 'Other'
];

const VISA_TYPES: Record<string, string[]> = {
  'Canada': ['Visitor Visa', 'Study Permit', 'Work Permit', 'Permanent Residence'],
  'United States': ['B1/B2', 'F1', 'H1B', 'EB1A', 'EB2 NIW', 'O1A'],
  'United Kingdom': ['Visitor', 'Student', 'Skilled Worker', 'Global Talent'],
  'Schengen Area': ['Tourist', 'Business', 'Student', 'Transit'],
  'Australia': ['Visitor', 'Student', 'Temporary Skill Shortage', 'Partner'],
  'New Zealand': ['Visitor', 'Student', 'Work', 'Resident'],
  'Singapore': ['Short Term Visit Pass', 'Student Pass', 'Employment Pass', 'S Pass'],
  'Other': ['Tourist', 'Student', 'Work', 'Business', 'Family Visit', 'Other']
};

const DEFAULT_QUESTIONS = {
  'Financial Evidence': [
    { id: 'bank_balance', label: 'Current bank balance (approx USD)', type: 'text' },
    { id: 'monthly_income', label: 'Monthly income (approx USD)', type: 'text' },
    { id: 'employment_status', label: 'Employment status', type: 'select', options: ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired'] },
    { id: 'sponsor_available', label: 'Sponsor available?', type: 'select', options: ['Yes', 'No'] },
    { id: 'sponsor_relation', label: 'Sponsor relationship (if yes)', type: 'text' },
    { id: 'additional_funds', label: 'Additional funds available?', type: 'select', options: ['Yes', 'No'] },
  ],
  'Travel History': [
    { id: 'prev_travel', label: 'Previous international travel?', type: 'select', options: ['Yes', 'No'] },
    { id: 'countries_visited', label: 'Countries visited previously', type: 'text' },
    { id: 'prev_visas_approved', label: 'Previous visas approved?', type: 'select', options: ['Yes', 'No'] },
    { id: 'prev_visas_refused', label: 'Previous visa refusals?', type: 'select', options: ['Yes', 'No'] },
  ],
  'Weak Home Ties': [
    { id: 'employment', label: 'Currently employed in home country?', type: 'select', options: ['Yes', 'No'] },
    { id: 'business_ownership', label: 'Business ownership?', type: 'select', options: ['Yes', 'No'] },
    { id: 'property_ownership', label: 'Property ownership?', type: 'select', options: ['Yes', 'No'] },
    { id: 'family_dependents', label: 'Family dependents in home country?', type: 'select', options: ['Yes', 'No'] },
  ],
  'Travel Purpose': [
    { id: 'reason', label: 'Primary reason for travel', type: 'text' },
    { id: 'funding', label: 'Who is funding the trip?', type: 'text' },
    { id: 'invitation', label: 'Supporting invitation available?', type: 'select', options: ['Yes', 'No'] },
    { id: 'length_stay', label: 'Intended length of stay (days)', type: 'text' },
  ]
};

export default function CaseWizard({ onSubmit }: CaseWizardProps) {
  const { user } = useCustomerAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [country, setCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const [refusalReasons, setRefusalReasons] = useState<{id: string, text: string, type: string}[]>([]);
  const [editingReason, setEditingReason] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [additionalEvidence, setAdditionalEvidence] = useState<File[]>([]);

  // UI State
  const [dragActive, setDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  // Removed drafting feature completely for privacy


  const nextStep = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 8));
  };
  
  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  // Step 1: Upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 2.5 * 1024 * 1024) {
      alert("File size exceeds 2.5MB limit to ensure it works with the system server limits. Please compress it."); return;
    }
    setFile(selectedFile);
    setIsExtracting(true);
    // Simulate AI extraction
    setTimeout(() => {
      setIsExtracting(false);
      setRefusalReasons([
        { id: '1', text: 'Insufficient financial evidence', type: 'Financial Evidence' },
        { id: '2', text: 'Weak ties to home country', type: 'Weak Home Ties' }
      ]);
      nextStep();
    }, 2000);
  };

  // Step 6: Additional Evidence
  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.size <= 2.5 * 1024 * 1024);
      if (validFiles.length < newFiles.length) alert("Some files exceeded the 2.5MB limit.");
      setAdditionalEvidence(prev => [...prev, ...validFiles]);
    }
  };

  const removeEvidence = (index: number) => {
    setAdditionalEvidence(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Generate
  const handleGenerate = () => {
    const questionnaireResponses: ExternalQuestionResponse[] = Object.entries(answers).map(([key, value]) => ({
      question: key,
      answer: value
    }));

    onSubmit({
      file,
      country,
      visaType,
      purpose: 'Appeal',
      travelHistory: 'Provided via questions',
      refusalReasons: refusalReasons.map(r => r.text),
      questionnaireResponses,
      additionalEvidence
    });
  };

  // Get active questions based on refusal reasons
  const getActiveQuestions = () => {
    const types = new Set(refusalReasons.map(r => r.type));
    let questions: any[] = [];
    types.forEach(t => {
      if (DEFAULT_QUESTIONS[t as keyof typeof DEFAULT_QUESTIONS]) {
        questions = [...questions, ...DEFAULT_QUESTIONS[t as keyof typeof DEFAULT_QUESTIONS]];
      }
    });
    if (questions.length === 0) {
      questions = [...DEFAULT_QUESTIONS['Travel Purpose']];
    }
    return questions;
  };

  const activeQuestions = getActiveQuestions();

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Upload Refusal Letter</h2>
              <p className="text-zinc-400 text-sm">Upload your rejection notice (PDF, DOCX, Image, or Text).</p>
            </div>

            <div 
              className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300 ${isExtracting ? 'border-indigo-500 bg-indigo-500/10' : dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !isExtracting && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} />
              
              {isExtracting ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <AlertCircle className="w-6 h-6 text-indigo-400" />
                    </motion.div>
                  </div>
                  <p className="text-white font-medium mb-1">AI extracting refusal information...</p>
                  <p className="text-xs text-indigo-400">Analyzing legal grounds and sections</p>
                </div>
              ) : (
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 shadow-inner group-hover:bg-zinc-700 transition">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-white mb-2">Click or drag document here</p>
                  <p className="text-sm text-zinc-500">Supports PDF, DOCX, JPG, PNG (Max 2.5MB)</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Select Destination</h2>
              <p className="text-zinc-400 text-sm">Which country issued the refusal?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COUNTRY_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => { setCountry(c); setVisaType(''); nextStep(); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${country === c ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'}`}
                >
                  <MapPin className={`w-5 h-5 ${country === c ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span className="font-medium">{c}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        const availableVisaTypes = VISA_TYPES[country] || VISA_TYPES['Other'];
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={prevStep}>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-700 transition">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </div>
              <div>
                 <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">{country}</p>
                 <h2 className="text-2xl font-semibold text-white">Select Visa Type</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {availableVisaTypes.map(v => (
                <button
                  key={v}
                  onClick={() => { setVisaType(v); nextStep(); }}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${visaType === v ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'}`}
                >
                   <span className="font-medium text-lg">{v}</span>
                   {visaType === v && <Check className="w-5 h-5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider rounded-full mb-4 ring-1 ring-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Analysis Complete</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">We identified the following refusal grounds</h2>
              <p className="text-zinc-400 text-sm">Please verify and correct down below to ensure highest appeal quality.</p>
            </div>

            <div className="space-y-4">
              {refusalReasons.map((reason, idx) => (
                <div key={reason.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 group flex justify-between items-center transition hover:border-zinc-700">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    </div>
                    {editingReason === reason.id ? (
                       <input 
                         autoFocus
                         className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                         value={reason.text}
                         onChange={(e) => {
                           const newReasons = [...refusalReasons];
                           newReasons[idx].text = e.target.value;
                           setRefusalReasons(newReasons);
                         }}
                         onBlur={() => setEditingReason(null)}
                         onKeyDown={(e) => e.key === 'Enter' && setEditingReason(null)}
                       />
                    ) : (
                      <p className="text-zinc-200 font-medium">{reason.text}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button onClick={() => setEditingReason(reason.id)} className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setRefusalReasons(refusalReasons.filter(r => r.id !== reason.id))} className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-rose-400 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setRefusalReasons([...refusalReasons, { id: Date.now().toString(), text: 'New refusal reason...', type: 'Other' }])}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition hover:bg-zinc-900"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-sm">Add Another Reason</span>
              </button>
            </div>

            <div className="pt-6">
              <button 
                onClick={nextStep}
                disabled={refusalReasons.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 font-semibold py-4 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Verification
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="mb-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider rounded-full mb-4 ring-1 ring-indigo-500/30">
                  Strategy Engine
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Dynamic Smart Questionnaire</h2>
              <p className="text-zinc-400 text-sm">Adapting questions strictly based on the refusal reasons detected.</p>
            </div>

            <div className="space-y-6">
              {activeQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">{q.label}</label>
                  {q.type === 'select' ? (
                     <select 
                        value={answers[q.label] || ''}
                        onChange={(e) => setAnswers({...answers, [q.label]: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                     >
                       <option value="" disabled>Select...</option>
                       {q.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                  ) : (
                     <input 
                        type="text"
                        value={answers[q.label] || ''}
                        onChange={(e) => setAnswers({...answers, [q.label]: e.target.value})}
                        placeholder="Provide details..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                     />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                onClick={prevStep}
                className="w-1/3 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white font-semibold py-4 rounded-xl hover:bg-zinc-800 transition"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="w-2/3 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-500 transition"
              >
                Continue to Evidence
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Additional Evidence Upload</h2>
              <p className="text-zinc-400 text-sm">Attach missing documents required to overcome refusal.</p>
            </div>

            <div className="space-y-4">
              <div 
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 hover:border-indigo-500 rounded-3xl bg-zinc-900/50 hover:bg-indigo-500/5 transition cursor-pointer"
                onClick={() => evidenceInputRef.current?.click()}
              >
                <input 
                  ref={evidenceInputRef} 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleEvidenceChange}
                />
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-white mb-1">Add additional evidence</p>
                <p className="text-xs text-zinc-500">Bank statements, salary slips, property docs</p>
              </div>

              {additionalEvidence.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-6 mb-2">Uploaded Documents</h4>
                  {additionalEvidence.map((file, idx) => (
                    <div key={idx} className="flex flex-row items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200 max-w-[200px] truncate">{file.name}</p>
                          <p className="text-[10px] text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => removeEvidence(idx)} className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={prevStep} className="w-1/3 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white font-semibold py-4 rounded-xl hover:bg-zinc-800 transition">
                Back
              </button>
              <button onClick={nextStep} className="w-2/3 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-500 transition">
                Review Case Profile
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Case Review Screen</h2>
              <p className="text-zinc-400 text-sm">Please review the case profile before generating the appeal package.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden text-sm">
              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Target Destination</h4>
                  <button onClick={() => { setStep(2); setDirection(-1); }} className="text-indigo-400 hover:text-indigo-300 transition">Edit</button>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-zinc-200">{country}</p>
                    <p className="text-xs text-zinc-500">{visaType}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Identified Refusals</h4>
                  <button onClick={() => { setStep(4); setDirection(-1); }} className="text-indigo-400 hover:text-indigo-300 transition">Edit</button>
                </div>
                <ul className="space-y-2">
                  {refusalReasons.map(r => (
                    <li key={r.id} className="flex gap-2 text-zinc-300 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Evidence Context</h4>
                  <button onClick={() => { setStep(5); setDirection(-1); }} className="text-indigo-400 hover:text-indigo-300 transition">Edit</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(answers).filter(([_, v]) => v).slice(0, 4).map(([q, a]) => (
                    <div key={q}>
                      <span className="block text-xs text-zinc-500 truncate">{q}</span>
                      <span className="block text-sm text-zinc-200 font-medium truncate">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Attached Evidence</h4>
                  <button onClick={() => { setStep(6); setDirection(-1); }} className="text-indigo-400 hover:text-indigo-300 transition">Edit</button>
                </div>
                <div className="text-zinc-300">
                  {additionalEvidence.length > 0 
                     ? `${additionalEvidence.length} document(s) prepared`
                     : `Refusal Notice only`}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={prevStep} className="w-1/3 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white font-semibold py-4 rounded-xl hover:bg-zinc-800 transition">
                Back
              </button>
              <button onClick={handleGenerate} className="w-2/3 relative group overflow-hidden bg-white text-zinc-950 font-semibold py-4 rounded-xl transition">
                <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
                  Generate Reapplication Preparation Package
                  <ChevronRight className="w-4 h-4" />
                </span>
                <div className="absolute inset-0 bg-zinc-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-950 border border-zinc-800/80 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Progress Bar */}
      {step > 1 && (
        <div className="mb-10 w-full">
           <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-3">
             <span>Step {step - 1} of 6</span>
             <span>{Math.round(((step - 1) / 6) * 100)}%</span>
           </div>
           <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
               initial={{ width: 0 }}
               animate={{ width: `${((step - 1) / 6) * 100}%` }}
               transition={{ duration: 0.5, ease: "easeInOut" }}
             />
           </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
           key={step}
           custom={direction}
           initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
           transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

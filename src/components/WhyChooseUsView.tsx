import { CheckCircle2, XCircle, ShieldCheck, Zap, Scale } from 'lucide-react';
import SEO from './SEO';
import { getBreadcrumbsSchema } from '../utils/seoSchemas';

interface Props {
  onClickStart: () => void;
}

export default function WhyChooseUsView({ onClickStart }: Props) {
  return (
    <>
      <SEO 
        title="Why Choose Us | Lumera"
        description="Discover why our AI-driven approach to visa refusal recovery is faster, more structured, and more effective than traditional agents or free templates."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Why Choose Us", url: "https://visaappealbuilder.com/why-choose-us" }
            ])
          ]
        }}
      />
      <div className="flex flex-col py-24 px-6 max-w-5xl mx-auto w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why Choose Lumera?</h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Not all visa recovery approaches are equal. See how our algorithm-driven, structured approach compares to traditional alternatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center opacity-70">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">Freelancers & Agents</h3>
          <ul className="text-sm text-zinc-400 space-y-3 text-left w-full mt-4">
            <li className="flex gap-2 items-start"><span className="text-red-500 mt-1">✗</span> Highly variable quality depending on the individual.</li>
            <li className="flex gap-2 items-start"><span className="text-red-500 mt-1">✗</span> Slow turnaround times (often days or weeks).</li>
            <li className="flex gap-2 items-start"><span className="text-red-500 mt-1">✗</span> Expensive and unpredictable pricing.</li>
            <li className="flex gap-2 items-start"><span className="text-red-500 mt-1">✗</span> Often reuse generic templates for different clients.</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center opacity-70">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">Free Generic Templates</h3>
          <ul className="text-sm text-zinc-400 space-y-3 text-left w-full mt-4">
            <li className="flex gap-2 items-start"><span className="text-orange-500 mt-1">✗</span> Consular officers easily recognize copy-pasted templates.</li>
            <li className="flex gap-2 items-start"><span className="text-orange-500 mt-1">✗</span> Does not address the highly specific reasons for your unique refusal.</li>
            <li className="flex gap-2 items-start"><span className="text-orange-500 mt-1">✗</span> Fails to provide a strategic roadmap for supporting documents.</li>
            <li className="flex gap-2 items-start"><span className="text-orange-500 mt-1">✗</span> Outdated formatting and language.</li>
          </ul>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500 p-8 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">THE CLEAR CHOICE</div>
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">Lumera</h3>
          <ul className="text-sm text-zinc-300 space-y-3 text-left w-full mt-4 font-medium">
            <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-1">✓</span> Analyzes the exact text of your refusal letter.</li>
            <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-1">✓</span> Applies advanced logical structuring tailored to consular reasoning.</li>
            <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-1">✓</span> Instant generation—get your appeal package in seconds.</li>
            <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-1">✓</span> Delivers a customized, mandatory evidence roadmap.</li>
          </ul>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Core Pillars of Our Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4 items-start">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Structural Analysis</h3>
              <p className="text-zinc-400">Our systems are designed to parse the exact regulatory clauses cited in your refusal, ensuring your appeal directly hits the legal burden of proof required by the embassy.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Zap className="w-8 h-8 text-yellow-400 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Speed & Precision</h3>
              <p className="text-zinc-400">Time is critical when appealing a decision. We eliminate the back-and-forth communication of traditional consulting, delivering precise results instantly.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Scale className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Evidence First</h3>
              <p className="text-zinc-400">Words alone don't overturn visas; documents do. We prioritize giving you a targeted checklist of irrefutable evidence you need to gather to win your case.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center border border-zinc-800 bg-zinc-900 rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-white mb-4">Don't risk another refusal on a generic template.</h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">Get a professional, logically structured appeal and tailored recovery strategy right now.</p>
        <button onClick={onClickStart} className="bg-white text-zinc-950 px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors">
          Start Your Appeal Process
        </button>
      </div>

    </div>
    </>
  );
}

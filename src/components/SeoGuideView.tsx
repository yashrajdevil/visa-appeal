import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Markdown from 'react-markdown';
import { seoGuides } from '../data/seoGuides';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Globe2, ChevronRight } from 'lucide-react';
import SEO from './SEO';
import { getArticleSchema, getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function SeoGuideView() {
  const { slug } = useParams<{ slug: string }>();
  const guide = seoGuides.find((g) => g.slug === slug);

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const relatedGuides = seoGuides.filter(g => guide.relatedSlugs.includes(g.slug));

  return (
    <>
      <SEO 
        title={`${guide.seoTitle} | Visa Appeal Builder`}
        description={guide.metaDescription}
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Guides", url: "https://visaappealbuilder.com/guides" },
              { name: guide.seoTitle, url: `https://visaappealbuilder.com/guides/${guide.slug}` }
            ]),
            getArticleSchema({
              title: guide.seoTitle,
              description: guide.metaDescription,
              url: `https://visaappealbuilder.com/guides/${guide.slug}`,
              datePublished: '2026-06-01T08:00:00+08:00',
              dateModified: '2026-06-15T08:00:00+08:00'
            })
          ]
        }}
      />
      <div className="flex flex-col py-16 px-6 max-w-4xl mx-auto w-full">
      <Link to="/guides" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Intelligence Hub
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm font-semibold px-3 py-1 bg-zinc-800 text-zinc-300 rounded-md flex items-center gap-1.5">
          <Globe2 className="w-4 h-4" />
          {guide.country}
        </span>
        <span className="text-sm font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-md flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          {guide.visaType}
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white leading-tight">
        {guide.seoTitle}
      </h1>
      
      <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
        {guide.metaDescription}
      </p>

      {/* Main Content Article */}
      <article className="prose prose-invert prose-zinc max-w-none w-full">
        {typeof guide.content === 'string' ? (
          <div className="markdown-body">
            <Markdown>{guide.content}</Markdown>
          </div>
        ) : (
          <>
            {/* Section 1: Meaning */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">What This Refusal Really Means</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-300 leading-relaxed">
                {guide.content.meaning}
              </div>
            </section>

            {/* Section 2: Why it happens */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">Why It Happens (Visa Officer Logic)</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                {guide.content.whyItHappens}
              </p>
            </section>

            {/* Section 3: Common Mistakes */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">Common Mistakes Applicants Make</h2>
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <ul className="space-y-3 m-0">
                  {guide.content.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex gap-3 text-zinc-300">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 4: What to Fix */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">What to Fix Before Reapplying</h2>
              <ul className="space-y-4 text-zinc-300">
                {guide.content.whatToFix.map((fix, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 5: Document Checklist */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Strategic Document Checklist</h2>
              
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="bg-zinc-800/50 px-6 py-3 font-semibold text-white border-b border-zinc-800">Required Core Evidence</div>
                  <div className="p-6">
                    <ul className="space-y-4 m-0 pl-0 list-none">
                      {guide.content.documentChecklist.required.map((doc, idx) => (
                        <li key={idx} className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                          <strong className="text-white block mb-1">{doc.item}</strong>
                          <span className="text-sm text-zinc-400">{doc.why}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="bg-zinc-800/50 px-6 py-3 font-semibold text-white border-b border-zinc-800">Recommended Strengthening Evidence</div>
                  <div className="p-6">
                    <ul className="space-y-4 m-0 pl-0 list-none">
                      {guide.content.documentChecklist.recommended.map((doc, idx) => (
                        <li key={idx} className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                          <strong className="text-white block mb-1">{doc.item}</strong>
                          <span className="text-sm text-zinc-400">{doc.why}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {guide.content.documentChecklist.optional.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-800/50 px-6 py-3 font-semibold text-white border-b border-zinc-800">Optional Contextual Evidence</div>
                    <div className="p-6">
                      <ul className="space-y-4 m-0 pl-0 list-none">
                        {guide.content.documentChecklist.optional.map((doc, idx) => (
                          <li key={idx} className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                            <strong className="text-white block mb-1">{doc.item}</strong>
                            <span className="text-sm text-zinc-400">{doc.why}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 6: Reapplication Strategy */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Step-by-Step Reapplication Strategy</h2>
              <div className="space-y-6 relative border-l border-indigo-500/30 ml-3 pl-8">
                {guide.content.reapplicationStrategy.map((strat, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-zinc-900 border border-indigo-500/50 flex items-center justify-center text-sm font-bold text-indigo-400">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{strat.step}</h3>
                    <p className="text-zinc-400">{strat.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </article>

      {/* CTA Section */}
      <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-8 md:p-12 text-center mb-16">
        <h2 className="text-2xl font-bold text-white mb-4">Don't guess what the embassy wants.</h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
          You read the guide, now get the structural execution. Upload your refusal letter and get a complete, personalized appeal package including case logic, weaknesses, and a structured cover letter.
        </p>
        <Link to="/flow" className="bg-indigo-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-600 transition-colors inline-block tracking-wide">
          Generate My Appeal Plan Automatically
        </Link>
      </div>

      {/* Internal Links / Related Articles */}
      {relatedGuides.length > 0 && (
        <div className="border-t border-zinc-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Immigration Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedGuides.map(related => (
              <Link key={related.id} to={`/guides/${related.slug}`} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition-colors group">
                <div>
                  <div className="text-xs text-indigo-400 font-semibold mb-1">{related.country} {related.visaType}</div>
                  <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{related.seoTitle}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe2, FileText, ArrowRight, Loader2 } from 'lucide-react';
import SEO from './SEO';
import { getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function SeoHubView() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await fetch('/api/blog-app/posts?type=guide');
        if (res.ok) {
          const data = await res.json();
          setGuides(data);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <>
      <SEO 
        title="Visa Refusal Recovery Guides"
        description="Expert analysis on overcoming the most common visa refusals worldwide. Understand the immigration logic and build a winning reapplication strategy."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Guides", url: "https://visaappealbuilder.com/guides" }
            ])
          ]
        }}
      />
      <div className="flex flex-col py-24 px-6 max-w-6xl mx-auto w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Visa Refusal Recovery Guides</h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Expert analysis on overcoming the most common visa refusals worldwide. Understand the immigration logic and build a winning reapplication strategy.
        </p>
      </div>

      {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link 
                key={guide.id} 
                to={`/guides/${guide.slug}`}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all group"
              >
                <div className="flex items-center gap-2 mb-4">
                  {guide.category && (
                    <span className="text-xs font-semibold px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md flex items-center gap-1">
                      <Globe2 className="w-3 h-3" />
                      {guide.category}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Report
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-indigo-300 transition-colors">
                  {guide.title}
                </h2>
                
                <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3">
                  {guide.excerpt}
                </p>
                
                <div className="flex items-center text-indigo-400 text-sm font-semibold gap-1 mt-auto group-hover:gap-2 transition-all">
                  <BookOpen className="w-4 h-4" />
                  Read Intelligence Report
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
      )}
      
      <div className="mt-20 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Need personalized help?</h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
          Don't rely on generic advice for your specific case. Upload your refusal letter and get a custom strategy tailored strictly to your circumstances.
        </p>
        <Link to="/flow" className="bg-white text-zinc-950 px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors inline-block">
          Analyze My Refusal Automatically
        </Link>
      </div>
    </div>
    </>
  );
}

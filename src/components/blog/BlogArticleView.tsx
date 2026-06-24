import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import parse from 'html-react-parser';
import SEO from '../SEO';
import { useArticles } from '../../hooks/useArticles';
import { getBreadcrumbsSchema, getArticleSchema } from '../../utils/seoSchemas';
import { Clock, ArrowLeft, Share2, Check, ChevronDown } from 'lucide-react';

export default function BlogArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const { getArticleBySlug, articles, incrementViews } = useArticles();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getArticleBySlug(slug).then(a => {
      setArticle(a);
      if (a) incrementViews(a.id);
      setLoading(false);
    });
  }, [slug, getArticleBySlug, incrementViews]);

  const readingTime = useMemo(() => {
    if (!article) return 0;
    return Math.max(1, Math.ceil(article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200));
  }, [article]);

  const headings = useMemo(() => {
    if (!article?.content) return [];
    const matches = article.content.matchAll(/<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi);
    return Array.from(matches).map((m, i) => ({
      level: parseInt(m[1]),
      text: m[2].replace(/<[^>]*>/g, ''),
      id: `heading-${i}`,
    }));
  }, [article]);

  const relatedArticles = useMemo(() => {
    if (!article || !slug) return [];
    const sameCat = articles.filter(a =>
      a.id !== article.id && a.status === 'published' &&
      a.categories?.some((c: string) => article.categories?.includes(c))
    );
    return sameCat.slice(0, 3);
  }, [article, articles, slug]);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen pt-24 pb-24 px-4 flex items-center justify-center text-zinc-500">Loading article...</div>;
  if (!article) return <Navigate to="/blog" replace />;

  const publishedDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const contentWithIds = article.content.replace(/<h([2-3])(.*?)>/gi, (match: string, level: string, attrs: string) => {
    const textMatch = match.match(/>([^<]*)</);
    const text = textMatch ? textMatch[1] : '';
    const id = `heading-${headings.findIndex(h => h.text === text && h.level === parseInt(level))}`;
    if (id.includes('-1')) return match;
    return `<h${level} id="${id}"${attrs}>`;
  });

  const publishedISO = article.publishedAt ? new Date(article.publishedAt).toISOString() : '';
  const modifiedISO = article.updatedAt ? new Date(article.updatedAt).toISOString() : publishedISO;

  return (
    <>
      <SEO
        title={article.seoTitle || `${article.title} | Lumera`}
        description={article.seoDescription || article.excerpt}
        imageUrl={article.ogImage || article.featuredImage}
        canonicalUrl={article.canonicalUrl}
        type="article"
        publishedTime={publishedISO}
        modifiedTime={modifiedISO}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Blog", url: "https://visaappealbuilder.com/blog" },
              { name: article.title, url: `https://visaappealbuilder.com/blog/${article.slug}` }
            ]),
            getArticleSchema({
              title: article.title,
              description: article.excerpt,
              imageUrl: article.featuredImage,
              url: `https://visaappealbuilder.com/blog/${article.slug}`,
              datePublished: publishedISO,
              dateModified: modifiedISO,
              authorName: article.author,
            })
          ]
        }}
      />
      <article className="min-h-screen pt-24 pb-24 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <Link to="/blog" className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Blog
        </Link>

        {article.featuredImage && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 bg-zinc-900">
            <img src={article.featuredImage} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mb-4">
          {article.categories?.map((c: string, i: number) => (
            <Link key={i} to={`/blog/category/${c.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-md hover:bg-indigo-500/20 transition-colors">
              {c}
            </Link>
          ))}
          {publishedDate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {publishedDate}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readingTime} min read</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">{article.title}</h1>

        {article.excerpt && (
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed">{article.excerpt}</p>
        )}

        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
            {article.author?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{article.author}</div>
            <div className="text-xs text-zinc-500">Published {publishedDate}</div>
          </div>
          <div className="flex-1" />
          <button onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        {headings.length > 0 && (
          <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <button onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between p-4 text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
              Table of Contents <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
            </button>
            {tocOpen && (
              <div className="px-4 pb-4 space-y-1">
                {headings.map((h, i) => (
                  <a key={i} href={`#${h.id}`}
                    className={`block text-sm py-1 hover:text-indigo-400 transition-colors ${h.level === 3 ? 'ml-4 text-zinc-500' : 'text-zinc-300'}`}>
                    {h.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_ul]:text-zinc-300 [&_ol]:text-zinc-300 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:bg-zinc-900 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:rounded-r-xl [&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_img]:rounded-xl [&_img]:my-8 [&_hr]:border-zinc-800 [&_pre]:bg-zinc-900 [&_pre]:border [&_pre]:border-zinc-800 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_code]:text-indigo-300 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-zinc-800 [&_th]:text-white [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-zinc-700 [&_td]:p-3 [&_td]:border [&_td]:border-zinc-800 [&_td]:text-zinc-300">
          {parse(contentWithIds)}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((t: string, i: number) => (
                <Link key={i} to={`/blog/tag/${t.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-12 border-t border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(r => (
                <Link key={r.id} to={`/blog/${r.slug}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group">
                  {r.featuredImage && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-4 bg-zinc-800">
                      <img src={r.featuredImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{r.title}</h3>
                  <p className="text-xs text-zinc-500 mt-2">{r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : ''}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}

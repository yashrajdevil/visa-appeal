import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SEO from '../SEO';
import { getBreadcrumbsSchema } from '../../utils/seoSchemas';
import { useBlogPosts } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import { Search, Clock, ArrowRight, Loader2 } from 'lucide-react';

const CATEGORY_SLUGS: Record<string, string> = {
  'visa': 'Visa', 'visitor-visa': 'Visitor Visa', 'student-visa': 'Student Visa',
  'work-permit': 'Work Permit', 'refusal': 'Refusal Reasons', 'refusal-reasons': 'Refusal Reasons',
  'financial': 'Financial Evidence', 'financial-evidence': 'Financial Evidence',
  'interview': 'Interview Tips', 'interview-tips': 'Interview Tips',
  'canada': 'Canada', 'uk': 'UK', 'usa': 'USA', 'australia': 'Australia',
};

export default function BlogHubView() {
  const { category, tag } = useParams<{ category?: string; tag?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { posts, loading, fetchPublished, loadMore, hasMore } = useBlogPosts();
  const { categories } = useCategories();

  useEffect(() => {
    const catName = category ? CATEGORY_SLUGS[category] || category.replace(/-/g, ' ') : undefined;
    fetchPublished(catName, tag, query || undefined);
  }, [category, tag, query, fetchPublished]);

  const displayCategory = category ? CATEGORY_SLUGS[category] || category.replace(/-/g, ' ') : null;
  const displayTag = tag ? tag.replace(/-/g, ' ') : null;

  let title = "Blog | Visa Reapplication Planning Platform";
  let description = "Read our latest articles, guides, and tips on visa applications and refusals.";
  if (displayCategory) { title = `${displayCategory} Articles | Blog`; description = `Articles about ${displayCategory}.`; }
  else if (displayTag) { title = `Articles tagged "${displayTag}" | Blog`; description = `Articles tagged with ${displayTag}.`; }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const q = fd.get('q') as string;
    if (q) setSearchParams({ q });
    else setSearchParams({});
  };

  function readingTime(content: string): number {
    return Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200));
  }

  return (
    <>
      <SEO
        title={title}
        description={description}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Blog", url: "https://visaappealbuilder.com/blog" }
            ])
          ]
        }}
      />
      <div className="flex flex-col py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight capitalize">{(displayCategory || displayTag || 'Blog').replace(/-/g, ' ')}</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">{description}</p>
        </div>

        {!category && !tag && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(c => (
              <Link key={c.id} to={`/blog/category/${c.slug}`}
                className="text-sm px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-indigo-500/50 transition-all">
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto w-full mb-16">
          <form onSubmit={handleSearch} className="relative">
            <input
              name="q" defaultValue={query}
              placeholder="Search articles..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-14 pr-6 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <Search className="w-5 h-5 text-zinc-500 absolute left-6 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading articles...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all group">
                  {post.featuredImage ? (
                    <div className="w-full h-48 bg-zinc-800 overflow-hidden">
                      <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <Clock className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {post.categories && post.categories.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {post.categories.map((c, i) => (
                          <span key={i} className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md">{c}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-indigo-300 transition-colors">{post.title}</h2>
                    <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto">
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readingTime(post.content)} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center text-zinc-500 py-12">
                {query ? `No articles matching "${query}".` : 'No articles published yet.'}
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-12">
                <button onClick={loadMore} className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-white px-8 py-3 rounded-full font-medium inline-flex items-center gap-2 transition-all">
                  Load More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

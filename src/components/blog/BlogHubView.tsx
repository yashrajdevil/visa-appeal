import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SEO from '../SEO';
import { getBreadcrumbsSchema } from '../../utils/seoSchemas';
import { Search } from 'lucide-react';

export default function BlogHubView() {
    const { category, tag } = useParams<{ category?: string; tag?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    let title = "Blog | Visa Reapplication Planning Platform";
    let description = "Read our latest articles, guides, and tips on visa applications and refusals.";
    
    if (category) {
        title = `${category.replace(/-/g, ' ')} | Blog`;
    } else if (tag) {
        title = `Articles tagged with ${tag.replace(/-/g, ' ')} | Blog`;
    }

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            let url = '/api/blog-app/posts?type=blog';
            if (query) url += `&search=${encodeURIComponent(query)}`;
            // In a fuller implementation, API endpoint could handle category/tag params.
            // For now, fetching all and filtering client side for speed & demonstration, or update API later.
            try {
                const res = await fetch(url);
                if (res.ok) {
                    let data = await res.json();
                    if (category) {
                        data = data.filter((p: any) => p.categorySlug === category);
                    }
                    if (tag) {
                        data = data.filter((p: any) => {
                            try {
                                const tags = JSON.parse(p.tagsJson || '[]');
                                return tags.map((t:string) => t.toLowerCase().replace(/\\s+/g, '-')).includes(tag);
                            } catch(e) { return false; }
                        });
                    }
                    setPosts(data);
                }
            } catch(e) {
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [category, tag, query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const q = fd.get('q') as string;
        if (q) setSearchParams({ q });
        else setSearchParams({});
    };

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
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight capitalize">{title.split(' | ')[0]}</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">{description}</p>
                </div>

                <div className="max-w-2xl mx-auto w-full mb-16">
                    <form onSubmit={handleSearch} className="relative">
                        <input 
                            name="q"
                            defaultValue={query}
                            placeholder="Search articles..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-14 pr-6 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <Search className="w-5 h-5 text-zinc-500 absolute left-6 top-1/2 -translate-y-1/2" />
                    </form>
                </div>

                {loading ? (
                    <div className="text-center text-zinc-500">Loading articles...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => (
                            <Link key={post.id} to={`/blog/${post.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all group">
                                {post.featuredImage && (
                                    <div className="w-full h-48 bg-zinc-800">
                                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    {post.category && (
                                        <div className="mb-4">
                                            <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md">
                                                {post.category}
                                            </span>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-indigo-300 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="text-xs text-zinc-500 mt-auto">
                                        {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {!loading && posts.length === 0 && (
                     <div className="text-center text-zinc-500 py-12">No articles found.</div>
                )}
            </div>
        </>
    );
}

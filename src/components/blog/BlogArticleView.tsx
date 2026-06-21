import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import parse, { domToReact, Element } from 'html-react-parser';
import SEO from '../SEO';
import { getArticleSchema, getBreadcrumbsSchema } from '../../utils/seoSchemas';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Add the component above BlogArticleView:
const TrackedCtaBanner = ({ headline, subline, button, url, theme, className, articleId }: any) => {
    const bannerRef = useRef<HTMLDivElement>(null);
    const hasTrackedView = useRef(false);

    useEffect(() => {
        if (!bannerRef.current || hasTrackedView.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasTrackedView.current) {
                hasTrackedView.current = true;
                observer.disconnect();
                
                fetch('/api/blog-app/track-cta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'view',
                        articleId,
                        headline,
                        buttonText: button,
                        destinationUrl: url
                    })
                }).catch(console.error);
            }
        }, { threshold: 0.3 });

        observer.observe(bannerRef.current);
        return () => observer.disconnect();
    }, [articleId, headline, button, url]);

    const handleBannerClick = () => {
        fetch('/api/blog-app/track-cta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'click',
                articleId,
                headline,
                buttonText: button,
                destinationUrl: url
            })
        }).catch(console.error);
    };

    const themeBg = theme === 'light' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-900 text-white border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800';
    const buttonTheme = theme === 'light' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-400 text-white';

    return (
        <div ref={bannerRef} className={`not-prose my-12 p-8 md:p-12 border rounded-2xl flex flex-col items-center justify-center text-center shadow-xl ${themeBg} ${className || ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">{headline}</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-80 leading-relaxed text-balance">{subline}</p>
            <a href={url} onClick={handleBannerClick} className={`inline-flex items-center justify-center rounded-lg px-8 py-4 font-bold text-lg transition-transform hover:scale-105 shadow-lg ${buttonTheme}`}>
                {button}
            </a>
        </div>
    );
};

export default function BlogArticleView() {
    const { slug } = useParams<{ slug: string }>();
    const [pageData, setPageData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog-app/posts/${slug}`);
                if (!res.ok) setError(true);
                else setPageData(await res.json());
            } catch(e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    if (error || !pageData) {
        return <Navigate to="/blog" replace />;
    }

    const { post, category } = pageData;
    let tags: string[] = [];
    try { tags = JSON.parse(post.tagsJson || '[]'); } catch(e) {}

    let faqs: any[] = [];
    try { faqs = JSON.parse(post.faqsJson || '[]'); } catch(e) {}

    const faqSchemaData = faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((f: any) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer }
        }))
    } : null;

    const schemaGraph = [
        getBreadcrumbsSchema([
            { name: "Home", url: "https://visaappealbuilder.com/" },
            { name: "Blog", url: "https://visaappealbuilder.com/blog" },
            ...(category ? [{ name: category.name, url: `https://visaappealbuilder.com/category/${category.slug}` }] : []),
            { name: post.title, url: `https://visaappealbuilder.com/blog/${post.slug}` }
        ]),
        getArticleSchema({
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt,
            url: `https://visaappealbuilder.com/blog/${post.slug}`,
            datePublished: new Date(post.publishedAt || post.createdAt).toISOString(),
            authorName: post.author
        })
    ];
    if (faqSchemaData) schemaGraph.push(faqSchemaData as any);

    // Dynamic TOC Generation and CTA Button Tracking by parsing the HTML
    const toc: { id: string, text: string, level: number }[] = [];
    
    const trackCtaClick = async (text: string, url: string) => {
        try {
            await fetch('/api/blog-app/track-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId: post.id,
                    buttonText: text,
                    destinationUrl: url
                })
            });
        } catch(e) {
            console.error('Failed to track click', e);
        }
    };

    const options = {
        replace: (domNode: any) => {
            if (domNode instanceof Element && ['h2', 'h3'].includes(domNode.name)) {
                // generate an id
                const text = domNode.children.map((c: any) => c.data || '').join('');
                if (text) {
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    toc.push({ id, text, level: parseInt(domNode.name.replace('h', '')) });
                    
                    domNode.attribs = { ...domNode.attribs, id };
                    return React.createElement(
                        domNode.name,
                        domNode.attribs,
                        domToReact(domNode.children as any, options)
                    );
                }
            }

            // Track CTA Buttons
            if (domNode instanceof Element && domNode.name === 'a') {
                const className = domNode.attribs?.class || '';
                if (className.includes('cta-button-track')) {
                    const text = domNode.attribs['data-text'] || domNode.children.map((c: any) => c.data || '').join('');
                    const url = domNode.attribs['data-url'] || domNode.attribs['href'] || '';
                    
                    let target = domNode.attribs['target'];
                    let rel = domNode.attribs['rel'];

                    // React elements don't automatically convert onclick string to function in html-react-parser
                    // We must attach an onClick handler in the react element

                    return React.createElement(
                        'a',
                        {
                            className,
                            href: url,
                            target,
                            rel,
                            onClick: () => trackCtaClick(text, url)
                        },
                        domToReact(domNode.children as any, options)
                    );
                }
            }

            // Track CTA Banners
            if (domNode instanceof Element && domNode.name === 'div') {
                const className = domNode.attribs?.class || '';
                if (className.includes('cta-banner-track')) {
                    const headline = domNode.attribs['data-headline'] || '';
                    const subline = domNode.attribs['data-subline'] || '';
                    const buttonText = domNode.attribs['data-button'] || '';
                    const url = domNode.attribs['data-url'] || '';
                    const theme = domNode.attribs['data-theme'] || 'dark';

                    return <TrackedCtaBanner 
                        articleId={post.id} 
                        headline={headline} 
                        subline={subline} 
                        button={buttonText} 
                        url={url} 
                        theme={theme} 
                    />;
                }
            }
        }
    };

    const parsedContent = post.content ? parse(post.content, options) : null;

    return (
        <>
            <SEO 
                title={post.metaTitle || `${post.title} | Visa Reapplication Planning Platform`}
                description={post.metaDescription || post.excerpt}
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@graph": schemaGraph
                }}
            />
            <div className="flex flex-col py-16 px-6 max-w-4xl mx-auto w-full">
                <Link to={post.postType === 'guide' ? "/guides" : "/blog"} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to {post.postType === 'guide' ? "Intelligence Hub" : "Blog"}
                </Link>
                
                {category && <div className="mb-4 text-sm text-indigo-400 font-semibold">{category.name}</div>}
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white leading-tight">
                    {post.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-12">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>Published: {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                </div>

                {post.featuredImage && (
                    <img src={post.featuredImage} alt={post.title} className="w-full h-auto rounded-2xl mb-12" />
                )}

                {toc.length > 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-12">
                        <h3 className="font-bold text-white mb-4">Table of Contents</h3>
                        <ul className="space-y-2">
                            {toc.map((item, idx) => (
                                <li key={idx} className={item.level === 3 ? "pl-4" : ""}>
                                    <a href={`#${item.id}`} className="text-zinc-400 hover:text-indigo-400 font-medium">
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Main Content Render */}
                <article className="prose prose-invert prose-zinc max-w-none w-full markdown-body">
                    {parsedContent}
                </article>

                {/* FAQs Render */}
                {faqs.length > 0 && (
                     <div className="mt-16 pt-16 border-t border-zinc-800">
                         <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
                         <div className="space-y-6">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-3 mt-0">{faq.question}</h3>
                                    <div className="text-zinc-400 leading-relaxed">{parse(faq.answer)}</div>
                                </div>
                            ))}
                         </div>
                     </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-zinc-800">
                        <h3 className="text-white font-bold mb-4">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag: string) => (
                                <Link key={tag} to={`/tag/${tag.toLowerCase().replace(/\\s+/g, '-')}`} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-300 hover:bg-zinc-700">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

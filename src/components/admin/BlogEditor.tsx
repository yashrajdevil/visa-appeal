import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Eye, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import SEO from '../SEO';
import { ErrorBoundary } from '../ErrorBoundary';
import RichTextEditor from './RichTextEditor';

export default function BlogEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [postType, setPostType] = useState('blog');
    const [tags, setTags] = useState(''); // Comma separated for UI
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [author, setAuthor] = useState('Admin');
    const [status, setStatus] = useState('draft');
    const [featuredImage, setFeaturedImage] = useState('');
    
    // FAQ Builder
    const [faqs, setFaqs] = useState<{question:string, answer:string}[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch('/api/blog-app/admin/categories');
            if(res.ok) setCategories(await res.json());
        };
        fetchCategories();

        if (id) {
            const fetchPost = async () => {
                const res = await fetch(`/api/blog-app/admin/posts/${id}`);
                if(res.ok) {
                    const data = await res.json();
                    setTitle(data.title || '');
                    setSlug(data.slug || '');
                    setContent(data.content || '');
                    setExcerpt(data.excerpt || '');
                    setCategoryId(data.categoryId || '');
                    setPostType(data.postType || 'blog');
                    setTags(data.tagsJson ? JSON.parse(data.tagsJson).join(', ') : '');
                    setMetaTitle(data.metaTitle || '');
                    setMetaDescription(data.metaDescription || '');
                    setAuthor(data.author || 'Admin');
                    setStatus(data.status || 'draft');
                    setFeaturedImage(data.featuredImage || '');
                    if (data.faqsJson) {
                        try {
                            setFaqs(JSON.parse(data.faqsJson));
                        } catch(e) {}
                    }
                }
            };
            fetchPost();
        }
    }, [id]);

    const handleSave = async (newStatus: string) => {
        setSaving(true);
        const postData = {
            title,
            slug,
            content,
            excerpt,
            postType,
            categoryId: categoryId ? parseInt(categoryId) : null,
            tagsJson: JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)),
            metaTitle,
            metaDescription,
            author,
            status: newStatus,
            featuredImage,
            faqsJson: JSON.stringify(faqs)
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/blog-app/admin/posts/${id}` : `/api/blog-app/admin/posts`;
        
        try {
            const res = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                const data = await res.json();
                setStatus(newStatus);
                if (!id) {
                    // Navigate to the edit view for the newly created post
                    navigate(`/admin/articles/edit/${data.id}`, { replace: true });
                }
            } else {
                alert('Failed to save. Ensure slug is unique.');
            }
        } catch (e) {
            alert('A network error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
    const updateFaq = (index: number, field: 'question'|'answer', value: string) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };
    const removeFaq = (index: number) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-black pb-24">
            <SEO title="Edit Article" description="" noindex={true} />
            
            {/* Topbar */}
            <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/articles" className="text-zinc-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4"/> Back
                    </Link>
                    <span className="text-sm font-medium px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                        Status: <span className={status === 'published' ? 'text-green-400' : 'text-amber-400'}>{status.toUpperCase()}</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.open(`/blog/${slug}`, '_blank')} className="text-zinc-300 hover:text-white flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button 
                        onClick={() => handleSave('draft')} 
                        disabled={saving}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button 
                        onClick={() => handleSave('published')} 
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        <Globe className="w-4 h-4" /> Publish
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Article Title</label>
                        <input 
                            value={title} onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 w-full p-4 rounded-xl text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="A compelling title..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main Content</label>
                        <ErrorBoundary fallback={
                            <textarea 
                                className="w-full h-[400px] bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 p-4 focus:outline-none focus:border-indigo-500" 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder="Rich text editor failed to load. You can continue writing HTML or text here."
                            />
                        }>
                            <RichTextEditor 
                                value={content}
                                onChange={setContent}
                                placeholder="Write your article content..."
                            />
                        </ErrorBoundary>
                    </div>

                    {/* FAQ Builder */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">FAQ Builder</h3>
                            <button onClick={addFaq} className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded flex items-center gap-2">
                                <Plus className="w-3 h-3"/> Add Question
                            </button>
                        </div>
                        <p className="text-sm text-zinc-400 mb-6">Automatically generates FAQPage Schema for SEO.</p>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-zinc-950 p-4 rounded-lg flex gap-4">
                                    <div className="flex-1 space-y-3">
                                        <input 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:border-indigo-500"
                                            placeholder="Question..."
                                            value={faq.question}
                                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                        />
                                        <textarea 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm h-20 focus:border-indigo-500"
                                            placeholder="Answer..."
                                            value={faq.answer}
                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => removeFaq(index)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Meta Info */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Organization</h3>
                        
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">URL Slug</label>
                            <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm" />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Article Type</label>
                            <select value={postType} onChange={e => setPostType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm">
                                <option value="blog">Blog Article</option>
                                <option value="guide">Guide (Intelligence Hub)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Category</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm">
                                <option value="">Select Category...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Tags (Comma separated)</label>
                            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="visa, appeal, study" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm" />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Author</label>
                            <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm" />
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Featured Image</h3>
                        {featuredImage ? (
                            <div className="relative group rounded overflow-hidden">
                                <img src={featuredImage} alt="Featured" className="w-full h-auto object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => setFeaturedImage('')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Remove</button>
                                </div>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/20 transition-all text-zinc-500">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Click to upload image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>

                    {/* SEO Config */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Search Engine Config</h3>
                        
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">SEO Title</label>
                            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Default format if blank" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm" />
                            <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                                <span>{metaTitle.length}/60 chars</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Meta Description</label>
                            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm h-24" />
                            <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                                <span>{metaDescription.length}/160 chars</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Excerpt (For blog feed)</label>
                            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm h-20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

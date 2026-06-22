import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Image as ImageIcon, Plus, Trash2, ExternalLink } from 'lucide-react';
import SEO from '../SEO';
import { ErrorBoundary } from '../ErrorBoundary';
import RichTextEditor from './RichTextEditor';
import { useArticles } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveArticle, getArticle } = useArticles();
  const { categories } = useCategories();
  const isEditing = !!id;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [status, setStatus] = useState('draft');
  const [featuredImage, setFeaturedImage] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      if (!id) return;
      const article = await getArticle(id);
      if (!article) { navigate('/admin/articles'); return; }
      setTitle(article.title);
      setSlug(article.slug);
      setContent(article.content);
      setExcerpt(article.excerpt);
      setCategoryIds(article.categories || []);
      setTags((article.tags || []).join(', '));
      setMetaTitle(article.seoTitle);
      setMetaDescription(article.seoDescription);
      setAuthor(article.author);
      setStatus(article.status);
      setFeaturedImage(article.featuredImage);
      setOgImage(article.ogImage);
      setCanonicalUrl(article.canonicalUrl);
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async (newStatus: 'draft' | 'published') => {
    setSaving(true);
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const catNames = categoryIds.map(cid => {
      const cat = categories.find(c => c.id === cid);
      return cat ? cat.name : '';
    }).filter(Boolean);

    const result = await saveArticle({
      id: isEditing ? id : undefined,
      title, slug: slug || undefined, content, excerpt,
      featuredImage: featuredImage || undefined,
      status: newStatus, author,
      categories: catNames,
      tags: tagList,
      seoTitle: metaTitle || undefined,
      seoDescription: metaDescription || undefined,
      ogImage: ogImage || undefined,
      canonicalUrl: canonicalUrl || undefined,
    });
    setSaving(false);
    if (result) {
      navigate(`/admin/articles/edit/${result}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'featured' | 'og') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'featured') setFeaturedImage(reader.result as string);
        else setOgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading article...</div>;

  return (
    <div className="min-h-screen bg-black pb-24">
      <SEO title={isEditing ? 'Edit Article' : 'New Article'} description="" noindex={true} />

      <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/articles')} className="text-zinc-400 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-medium px-2 py-1 bg-zinc-800 rounded text-zinc-400">
            Status: <span className={status === 'published' ? 'text-green-400' : 'text-amber-400'}>{status.toUpperCase()}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && status === 'published' && (
            <a href={`/blog/${slug}`} target="_blank" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
              <ExternalLink className="w-4 h-4" /> View
            </a>
          )}
          <button
            onClick={() => handleSave('draft')} disabled={saving}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave('published')} disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Globe className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Rich text editor failed to load. You can continue writing HTML or text here."
              />
            }>
              <RichTextEditor value={content} onChange={setContent} placeholder="Write your article content..." />
            </ErrorBoundary>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Organization</h3>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">URL Slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" placeholder="Auto-generated from title" />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      categoryIds.includes(c.id) ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
                {categories.length === 0 && <span className="text-xs text-zinc-500">No categories created yet.</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Tags (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="visa, appeal, study" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" />
            </div>
          </div>

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
                <span className="text-sm font-medium">Click to upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'featured')} />
              </label>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Search Engine Config</h3>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">SEO Title</label>
              <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" />
              <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                <span>{metaTitle.length}/60 chars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Meta Description</label>
              <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white h-24" />
              <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                <span>{metaDescription.length}/160 chars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Excerpt (for blog feed)</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white h-20" />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Open Graph Image</label>
              {ogImage ? (
                <div className="relative group rounded overflow-hidden">
                  <img src={ogImage} alt="OG" className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setOgImage('')} className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">Remove</button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-all text-zinc-500">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs">Upload OG image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'og')} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Canonical URL</label>
              <input value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

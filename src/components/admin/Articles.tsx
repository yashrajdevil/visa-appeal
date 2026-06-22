import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare, Trash2, Plus, FileText, Search } from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';

export default function Articles() {
  const { articles, loading, deleteArticle, fetchArticles } = useArticles();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const ok = await deleteArticle(id);
    if (ok) fetchArticles();
  };

  const filtered = articles.filter(a => {
    if (filter === 'published' && a.status !== 'published') return false;
    if (filter === 'drafts' && a.status !== 'draft') return false;
    if (search) {
      const s = search.toLowerCase();
      return a.title.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="text-indigo-400 w-8 h-8" /> Articles
        </h1>
        <Link
          to="/admin/articles/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'published', 'drafts'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors whitespace-nowrap ${
                  filter === f ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'all' ? ` (${articles.length})` : f === 'published' ? ` (${articles.filter(a => a.status === 'published').length})` : ` (${articles.filter(a => a.status === 'draft').length})`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-12">Loading articles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-300">
                <tr>
                  <th className="p-3 rounded-tl-lg font-semibold">Title</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Categories</th>
                  <th className="p-3 font-semibold">Views</th>
                  <th className="p-3 font-semibold">Updated</th>
                  <th className="p-3 rounded-tr-lg font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white truncate max-w-[300px]">{a.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">/{a.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        a.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-500'
                      }`}>{a.status.toUpperCase()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(a.categories || []).slice(0, 2).map((c, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">{c}</span>
                        ))}
                        {(a.categories || []).length > 2 && <span className="text-xs text-zinc-500">+{a.categories.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400">{a.views}</td>
                    <td className="p-4 text-zinc-400">{new Date(a.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link to={`/admin/articles/edit/${a.id}`} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
                          <PenSquare className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={() => handleDelete(a.id, a.title)} className="text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-zinc-500">No articles found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

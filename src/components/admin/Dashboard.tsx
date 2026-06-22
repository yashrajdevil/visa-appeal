import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, Eye, ArrowUpRight } from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';

export default function Dashboard() {
  const { articles, loading, totalCount, publishedCount, draftCount } = useArticles();
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const recentArticles = [...articles].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{loading ? '...' : totalCount}</div>
          <div className="text-sm text-zinc-400">Total Articles</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{loading ? '...' : publishedCount}</div>
          <div className="text-sm text-zinc-400">Published</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{loading ? '...' : draftCount}</div>
          <div className="text-sm text-zinc-400">Drafts</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{loading ? '...' : totalViews.toLocaleString()}</div>
          <div className="text-sm text-zinc-400">Total Views</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Articles</h2>
          <Link to="/admin/articles" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center text-zinc-500 py-8">Loading...</div>
        ) : recentArticles.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">No articles yet. <Link to="/admin/articles/new" className="text-indigo-400 hover:underline">Create one</Link></div>
        ) : (
          <div className="space-y-3">
            {recentArticles.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{a.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {a.status === 'published' ? <span className="text-green-400">Published</span> : <span className="text-amber-400">Draft</span>}
                    {' · '}{new Date(a.updatedAt).toLocaleDateString()}{a.views > 0 ? ` · ${a.views} views` : ''}
                  </div>
                </div>
                <Link to={`/admin/articles/edit/${a.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium ml-4">Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

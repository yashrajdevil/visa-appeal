import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, Trash2, Plus, FileText } from 'lucide-react';

export default function Articles() {
    const [posts] = useState<any[]>([]);
    const [filter, setFilter] = useState<string>('all');

    const filteredPosts = posts.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'guides') return p.postType === 'guide';
        if (filter === 'blog') return p.postType === 'blog';
        if (filter === 'drafts') return p.status === 'draft';
        if (filter === 'published') return p.status === 'published';
        return true;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FileText className="text-indigo-400 w-8 h-8" /> Articles
                </h1>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors opacity-50 cursor-not-allowed" disabled title="Not available in static mode">
                    <Plus className="w-4 h-4" /> New Article
                </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'guides', 'blog', 'drafts', 'published'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                        >
                            {f.replace('guides', 'Guides').replace('blog', 'Blog')}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-800 text-zinc-300">
                            <tr>
                                <th className="p-3 rounded-tl-lg font-semibold">Title</th>
                                <th className="p-3 font-semibold">Type</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold">Date Updated</th>
                                <th className="p-3 rounded-tr-lg font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map(p => (
                                <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 font-medium truncate max-w-[300px] text-white py-4">{p.title}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${p.postType === 'guide' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {p.postType}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-zinc-400">{new Date(p.updatedAt).toLocaleDateString()}</td>
                                    <td className="p-4 flex items-center gap-4">
                                        <Link to={`/admin/articles/edit/${p.id}`} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
                                            <PenSquare className="w-4 h-4"/> Edit
                                        </Link>
                                        <button className="text-red-400/50 flex items-center gap-1.5 opacity-50 cursor-not-allowed" disabled>
                                            <Trash2 className="w-4 h-4"/> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500">No articles created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

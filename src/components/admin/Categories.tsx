import React, { useState } from 'react';
import { Tags, Plus, X, Check } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function Categories() {
    const [categories] = useState<Category[]>([]);
    const [editId] = useState<number | null>(null);
    const [editName] = useState('');
    const [editSlug] = useState('');
    
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Creating categories is not available in static mode.');
    };

    const handleUpdate = (id: number) => {
        alert('Updating categories is not available in static mode.');
    };

    const handleDelete = (id: number) => {
        alert('Deleting categories is not available in static mode.');
    };

    const startEdit = (cat: Category) => {};

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
                <Tags className="text-indigo-400 w-8 h-8" /> Categories
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create New Form */}
                <div className="md:col-span-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4 border-b border-zinc-800 pb-2">Add New Category</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. Travel Guides"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Slug (optional)</label>
                                <input
                                    type="text"
                                    value={newSlug}
                                    onChange={(e) => setNewSlug(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. travel-guides"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Category
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-800 text-zinc-300">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Slug</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4 font-medium text-white">{cat.name}</td>
                                        <td className="p-4 text-zinc-400 font-mono text-xs">{cat.slug}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="text-zinc-600 opacity-50 cursor-not-allowed">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                </span>
                                                <span className="text-zinc-600 opacity-50 cursor-not-allowed">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-zinc-500">No categories found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

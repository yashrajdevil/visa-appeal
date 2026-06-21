import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, PenSquare, X, Check } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');

    const fetchCategories = async () => {
        const res = await fetch('/api/blog-app/admin/categories');
        if (res.ok) setCategories(await res.json());
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/blog-app/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, slug: newSlug })
        });
        if (res.ok) {
            setNewName('');
            setNewSlug('');
            fetchCategories();
        } else {
            alert('Failed to create category. Ensure slug is unique.');
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`/api/blog-app/admin/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName, slug: editSlug })
        });
        if (res.ok) {
            setEditId(null);
            fetchCategories();
        } else {
            alert('Failed to update category. Ensure slug is unique.');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            await fetch(`/api/blog-app/admin/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        }
    };

    const startEdit = (cat: Category) => {
        setEditId(cat.id);
        setEditName(cat.name);
        setEditSlug(cat.slug);
    };

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
                                        {editId === cat.id ? (
                                            <>
                                                <td className="p-3">
                                                    <input 
                                                        type="text" 
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input 
                                                        type="text" 
                                                        value={editSlug}
                                                        onChange={(e) => setEditSlug(e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleUpdate(cat.id)} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setEditId(null)} className="p-1.5 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 font-medium text-white">{cat.name}</td>
                                                <td className="p-4 text-zinc-400 font-mono text-xs">{cat.slug}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button onClick={() => startEdit(cat)} className="text-zinc-400 hover:text-indigo-400 transition-colors">
                                                            <PenSquare className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(cat.id)} className="text-zinc-400 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
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

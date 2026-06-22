import { useState } from 'react';
import { Tags, Plus, Trash2, PenSquare, Check, X } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

export default function Categories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ok = await createCategory(newName.trim(), newSlug.trim() || undefined, newDesc.trim() || undefined);
    if (ok) { setNewName(''); setNewSlug(''); setNewDesc(''); }
  };

  const startEdit = (cat: typeof categories[0]) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDesc(cat.description || '');
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    await updateCategory(editId, editName.trim(), editSlug.trim() || undefined, editDesc.trim() || undefined);
    setEditId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    await deleteCategory(id);
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading categories...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <Tags className="text-indigo-400 w-8 h-8" /> Categories
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 border-b border-zinc-800 pb-2">Add New Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                <input
                  type="text" required value={newName}
                  onChange={(e) => { setNewName(e.target.value); if (!newSlug) setNewSlug(slugify(e.target.value)); }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Visitor Visa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Slug</label>
                <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="auto-generated" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-300">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Slug</th>
                  <th className="p-4 font-semibold">Articles</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    {editId === cat.id ? (
                      <>
                        <td className="p-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white" />
                        </td>
                        <td className="p-2">
                          <input value={editSlug} onChange={e => setEditSlug(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white font-mono" />
                        </td>
                        <td className="p-2 text-zinc-400">-</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={handleUpdate} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditId(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-medium text-white">{cat.name}</td>
                        <td className="p-4 text-zinc-400 font-mono text-xs">{cat.slug}</td>
                        <td className="p-4 text-zinc-400">-</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => startEdit(cat)} className="text-indigo-400 hover:text-indigo-300 transition-colors" title="Edit">
                              <PenSquare className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No categories found. Create one to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

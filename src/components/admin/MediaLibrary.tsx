import { useRef, useState } from 'react';
import { ImageIcon, Upload, Trash2, Copy, Check, Search, Loader2 } from 'lucide-react';
import { useMediaLibrary } from '../../hooks/useArticles';

export default function MediaLibrary() {
  const { media, loading, uploadFile, deleteMedia } = useMediaLibrary();
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadFile(file);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCopy = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, url: string) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    await deleteMedia(id, url);
  };

  const filtered = search ? media.filter(m => m.name.toLowerCase().includes(search.toLowerCase())) : media;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ImageIcon className="text-indigo-400 w-8 h-8" /> Media Library
        </h1>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="relative max-w-xs mb-8">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search media..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-12">Loading media...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
              <div className="aspect-square relative bg-zinc-950 flex items-center justify-center p-2">
                <img src={item.url} alt={item.name} className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleCopy(item.id, item.url)} title="Copy URL" className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors">
                    {copiedId === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(item.id, item.url)} title="Delete Image" className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-300 truncate" title={item.name}>{item.name}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{new Date(item.uploadedAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl border-dashed">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{search ? 'No media matching search.' : 'No media uploaded yet.'}</p>
              <p className="text-sm mt-1">Upload images to reuse them across your articles.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

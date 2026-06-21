import React, { useState } from 'react';
import { ImageIcon, Upload, Trash2, Copy, Check } from 'lucide-react';

interface MediaItem {
    id: number;
    url: string;
    filename: string;
    altText: string;
    uploadedAt: number;
}

export default function MediaLibrary() {
    const [mediaItems] = useState<MediaItem[]>([]);
    const [uploading] = useState(false);
    const [copiedId] = useState<number | null>(null);

    const handleCopy = (id: number, url: string) => {
        navigator.clipboard.writeText(url);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ImageIcon className="text-indigo-400 w-8 h-8" /> Media Library
                </h1>
                <span className="bg-zinc-700 text-zinc-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <Upload className="w-4 h-4" /> Upload Image
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {mediaItems.map(item => (
                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
                        <div className="aspect-square relative bg-zinc-950 flex items-center justify-center p-2">
                            <img src={item.url} alt={item.altText} className="max-w-full max-h-full object-contain" />
                            
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleCopy(item.id, item.url)}
                                    title="Copy URL"
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
                                >
                                    {copiedId === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <span
                                    title="Delete Image"
                                    className="p-2 bg-red-500/10 text-red-100/50 rounded-full opacity-50 cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                        <div className="p-3 border-t border-zinc-800">
                            <div className="text-xs text-zinc-300 truncate" title={item.filename}>{item.filename}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">{new Date(item.uploadedAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
                
                {mediaItems.length === 0 && !uploading && (
                    <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl border-dashed">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No media uploaded yet.</p>
                        <p className="text-sm mt-1">Upload images to reuse them across your articles and site pages.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

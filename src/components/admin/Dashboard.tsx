import React from 'react';
import { Layers, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const analytics: any[] = [];
    const totalClicks = 0;

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full">
                        <Layers className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-400">Welcome</div>
                        <div className="text-lg font-bold text-white">To the New CMS</div>
                    </div>
                </div>
                
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-green-500/10 text-green-400 rounded-full">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-400">Total CTA Clicks</div>
                        <div className="text-2xl font-bold text-white">{totalClicks}</div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-12">
                Top Performing CTAs
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-800 text-zinc-400">
                        <tr>
                            <th className="p-4 font-semibold">Headline & Button</th>
                            <th className="p-4 font-semibold">Destination URL</th>
                            <th className="p-4 font-semibold">Article</th>
                            <th className="p-4 font-semibold text-right">Views</th>
                            <th className="p-4 font-semibold text-right">Clicks</th>
                            <th className="p-4 font-semibold text-right">CTR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.map((item, i) => {
                            const ctr = item.views > 0 ? ((item.clicks / item.views) * 100).toFixed(1) : '0.0';
                            return (
                            <tr key={i} className="border-b border-zinc-800">
                                <td className="p-4 font-medium text-white max-w-[300px] truncate">
                                    <div className="text-zinc-300 mb-1" title={item.headline || 'No Headline (Simple Button)'}>{item.headline || 'No Headline'}</div>
                                    <div className="text-xs text-indigo-400 font-semibold">{item.buttonText}</div>
                                </td>
                                <td className="p-4 text-zinc-400 truncate max-w-[200px]" title={item.destinationUrl}>{item.destinationUrl}</td>
                                <td className="p-4 text-zinc-400">{item.articleTitle || 'Global'}</td>
                                <td className="p-4 font-mono text-zinc-400 text-right">{item.views}</td>
                                <td className="p-4 font-bold text-indigo-400 text-right">{item.clicks}</td>
                                <td className="p-4 font-mono text-green-400 text-right">{ctr}%</td>
                            </tr>
                        )})}
                        {analytics.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-zinc-500">No button clicks tracked yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

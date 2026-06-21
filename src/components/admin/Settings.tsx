import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        siteName: '',
        metaDescription: '',
        contactEmail: '',
        socialLinks: '',
        logoUrl: '',
        faviconUrl: ''
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        alert('Settings save is not available in static mode.');
        setSaving(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <SettingsIcon className="text-indigo-400 w-8 h-8" /> Site Settings
                </h1>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <form className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. Visa Appeal Builder"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">Meta Description</label>
                            <textarea
                                name="metaDescription"
                                value={settings.metaDescription}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                placeholder="Site-wide meta description for SEO"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">Contact Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={settings.contactEmail}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                placeholder="support@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">Logo URL</label>
                            <input
                                type="url"
                                name="logoUrl"
                                value={settings.logoUrl}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 mb-2"
                                placeholder="https://..."
                            />
                            {settings.logoUrl && (
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center">
                                    <img src={settings.logoUrl} alt="Logo Preview" className="max-h-16" />
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">Favicon URL</label>
                            <input
                                type="url"
                                name="faviconUrl"
                                value={settings.faviconUrl}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 mb-2"
                                placeholder="https://..."
                            />
                            {settings.faviconUrl && (
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center">
                                    <img src={settings.faviconUrl} alt="Favicon Preview" className="max-h-8" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">Social Links JSON</label>
                            <textarea
                                name="socialLinks"
                                value={settings.socialLinks}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                                placeholder='{"twitter": "https://...", "linkedin": "..."}'
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

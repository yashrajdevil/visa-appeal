import { useState } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2, Shield, DollarSign, Type, SearchIcon, Eye, Layout } from 'lucide-react';
import { useAdminSettings } from '../../hooks/useAdminSettings';

export default function Settings() {
  const {
    settings, loading, saving, error,
    users, usersLoading, isSuperAdmin,
    saveSettings, addUser, updateUser, deleteUser, fetchUsers,
  } = useAdminSettings();

  const [pricingForm, setPricingForm] = useState<Record<string, any>>({});
  const [ctaForm, setCtaForm] = useState<Record<string, any>>({});
  const [seoForm, setSeoForm] = useState<Record<string, any>>({});
  const [brandingForm, setBrandingForm] = useState<Record<string, any>>({});
  const [featuresForm, setFeaturesForm] = useState<Record<string, any>>({});
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('editor');
  const [activeTab, setActiveTab] = useState('pricing');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto w-full flex items-center justify-center text-zinc-500 min-h-[50vh]">Loading settings...</div>;
  }

  const initForm = () => {
    if (!settings) return;
    setPricingForm(settings.pricing);
    setCtaForm(settings.cta);
    setSeoForm(settings.seo);
    setBrandingForm(settings.branding);
    setFeaturesForm(settings.features);
  };
  if (!pricingForm.starter && settings) initForm();

  const handleSave = async (field: string, data: any) => {
    const ok = await saveSettings({ [field]: data });
    if (ok) showToast(`${field} settings saved`);
    else showToast('Failed to save settings');
  };

  const handleAddUser = async () => {
    if (!newUserEmail) return;
    const ok = await addUser(newUserEmail, newUserRole);
    if (ok) { showToast(`User ${newUserEmail} added`); setNewUserEmail(''); }
    else showToast('Failed to add user');
  };

  const tabs = [
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'cta', label: 'CTA Text', icon: <Type className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO Defaults', icon: <SearchIcon className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <Eye className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Layout className="w-4 h-4" /> },
    ...(isSuperAdmin ? [{ id: 'users', label: 'Admin Users', icon: <Shield className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="text-indigo-400 w-8 h-8" /> Settings
        </h1>
        {isSuperAdmin && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-medium">Super Admin</span>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex gap-1 mb-8 border-b border-zinc-800 pb-0.5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      {activeTab === 'pricing' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Pricing Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {['starter', 'standard', 'premium'].map(p => (
              <div key={p} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                <label className="block text-sm font-bold text-zinc-400 mb-3 capitalize">{p} Plan ($)</label>
                <input type="number" min="0" step="0.01"
                  value={(pricingForm as any)[p] ?? ''}
                  onChange={e => setPricingForm({ ...pricingForm, [p]: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-2xl font-bold"
                />
              </div>
            ))}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-zinc-400 mb-2">Currency</label>
            <select value={pricingForm.currency || 'USD'} onChange={e => setPricingForm({ ...pricingForm, currency: e.target.value })}
              className="w-full max-w-xs bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
          <button onClick={() => handleSave('pricing', pricingForm)} disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Pricing
          </button>
        </div>
      )}

      {activeTab === 'cta' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">CTA Text Settings</h2>
          <div className="space-y-5">
            {(['headline', 'subtitle', 'buttonText'] as const).map(f => (
              <div key={f}>
                <label className="block text-sm font-bold text-zinc-400 mb-2 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
                {f === 'subtitle' ? (
                  <textarea rows={2} value={ctaForm[f] ?? ''} onChange={e => setCtaForm({ ...ctaForm, [f]: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                ) : (
                  <input type="text" value={ctaForm[f] ?? ''} onChange={e => setCtaForm({ ...ctaForm, [f]: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                )}
              </div>
            ))}
          </div>
          <button onClick={() => handleSave('cta', ctaForm)} disabled={saving}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save CTA Text
          </button>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">SEO Defaults</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Site Title</label>
              <input type="text" value={seoForm.siteTitle ?? ''} onChange={e => setSeoForm({ ...seoForm, siteTitle: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Meta Description</label>
              <textarea rows={3} value={seoForm.metaDescription ?? ''} onChange={e => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Default OG Image URL</label>
              <input type="url" value={seoForm.ogImage ?? ''} onChange={e => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <button onClick={() => handleSave('seo', seoForm)} disabled={saving}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save SEO Defaults
          </button>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Branding Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Site Name</label>
              <input type="text" value={brandingForm.siteName ?? ''} onChange={e => setBrandingForm({ ...brandingForm, siteName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Logo URL</label>
              <input type="url" value={brandingForm.logoUrl ?? ''} onChange={e => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              {brandingForm.logoUrl && (
                <div className="mt-2 p-4 bg-zinc-950 border border-zinc-800 rounded-lg inline-flex items-center justify-center">
                  <img src={brandingForm.logoUrl} alt="Preview" className="max-h-12" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Favicon URL</label>
              <input type="url" value={brandingForm.faviconUrl ?? ''} onChange={e => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <button onClick={() => handleSave('branding', brandingForm)} disabled={saving}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Branding
          </button>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Feature Toggles</h2>
          <div className="space-y-4">
            {(['enableBlog', 'enableGuides', 'enableSampleReport'] as const).map(f => (
              <label key={f} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="text-zinc-300 font-medium capitalize">{f.replace('enable', '').replace(/([A-Z])/g, ' $1')}</span>
                <div className="relative">
                  <input type="checkbox" checked={!!(featuresForm as any)[f]} onChange={e => setFeaturesForm({ ...featuresForm, [f]: e.target.checked })}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </div>
              </label>
            ))}
          </div>
          <button onClick={() => handleSave('features', featuresForm)} disabled={saving}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Feature Toggles
          </button>
        </div>
      )}

      {activeTab === 'users' && isSuperAdmin && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Add Admin User</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-bold text-zinc-400 mb-2">Email</label>
                <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Role</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="author">Author</option>
                </select>
              </div>
              <button onClick={handleAddUser}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Admin Users ({users.length})</h2>
            {usersLoading ? (
              <div className="text-zinc-500 text-center py-8">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">No admin users yet.</div>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{u.email}</div>
                      <div className="text-xs text-zinc-500 flex gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'superadmin' ? 'bg-amber-500/10 text-amber-400' :
                          u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-zinc-500/10 text-zinc-400'
                        }`}>{u.role}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>{u.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select value={u.role} onChange={e => updateUser(u.id, { role: e.target.value })}
                        className="text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300">
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="author">Author</option>
                      </select>
                      <button onClick={() => updateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })}
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          u.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        } transition-colors`}>
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => deleteUser(u.id)}
                        className="text-xs px-2 py-1 rounded font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

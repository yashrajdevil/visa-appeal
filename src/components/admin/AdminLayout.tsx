import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Tags, Image as ImageIcon, Search, Settings, Users, LogOut, Loader2 } from 'lucide-react';
import SEO from '../SEO';

export default function AdminLayout() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUserEmail(data.user.email);
                    setAuthenticated(true);
                } else {
                    navigate('/admin');
                }
            } catch (e) {
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [navigate]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        navigate('/admin');
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    if (!authenticated) {
        return null;
    }

    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/articles', icon: <FileText className="w-5 h-5" />, label: 'Articles' },
        { path: '/admin/categories', icon: <Tags className="w-5 h-5" />, label: 'Categories' },
        { path: '/admin/media', icon: <ImageIcon className="w-5 h-5" />, label: 'Media Library' },
        { path: '/admin/seo', icon: <Search className="w-5 h-5" />, label: 'SEO' },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
        { path: '/admin/diagnostics', icon: <Settings className="w-5 h-5" />, label: 'Diagnostics' },
        { path: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    ];

    return (
        <div className="flex min-h-screen bg-black">
            <SEO title="Admin CMS | Visa Appeal Builder" description="" noindex={true} />
            
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col hidden md:flex sticky top-0 h-screen">
                <div className="p-6 border-b border-zinc-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">CMS Admin</h1>
                    <p className="text-xs text-zinc-500 mt-1 truncate">{userEmail}</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                                    ? 'bg-indigo-500/10 text-indigo-400' 
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                    <Link to="/" target="_blank" className="block text-center mt-4 text-xs text-zinc-600 hover:text-zinc-400">View Public Site ↗</Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <div className="md:hidden bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-lg font-bold">CMS Admin</h1>
                    <button onClick={handleLogout} className="text-zinc-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

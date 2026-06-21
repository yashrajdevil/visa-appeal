import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Files, FolderOpen, Settings, LogOut } from 'lucide-react';
import SEO from '../SEO';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { user, logout } = useCustomerAuth();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Purchase History', path: '/dashboard/orders', icon: ShoppingBag },
    { name: 'My Documents', path: '/dashboard/documents', icon: Files },
    { name: 'Case History', path: '/dashboard/cases', icon: FolderOpen },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <SEO title="Dashboard | Visa Appeal Builder" description="" noindex={true} />
      <div className="flex bg-zinc-950 min-h-[calc(100vh-64px)] w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Client Portal</h2>
            <p className="text-xs text-zinc-500 mt-1">{user?.email || ''}</p>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-zinc-800">
             <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition-colors">
               <LogOut className="w-4 h-4" />
               Sign Out
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <div className="p-6 lg:p-10 flex-1 overflow-y-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

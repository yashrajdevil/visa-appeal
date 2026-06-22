import { Logo } from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCustomerAuth();

  const handleNavClick = (path: string) => {
    if (!path.startsWith('#')) {
      navigate('/' + path.replace(/^\//, ''));
      window.scrollTo(0, 0);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/' + path);
    } else {
      const el = document.getElementById(path.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('')}>
          <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => handleNavClick('#hero')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200">
            Home
          </button>
          <button onClick={() => handleNavClick('#how-it-works')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200">
            How it works
          </button>
          <button onClick={() => handleNavClick('#pricing')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200">
            Pricing
          </button>
          
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={() => navigate('/flow')}
            className="text-sm font-medium bg-white text-zinc-950 px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors duration-200"
          >
            Start Appeal
          </button>
        </nav>
      </div>
    </header>
  );
}

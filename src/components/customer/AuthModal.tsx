import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, X } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useCustomerAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5"/>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="text-zinc-400 text-sm">
            {isLogin ? 'Sign in to start your appeal process' : 'Start managing your Visa Appeals effectively'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
          
          {!isLogin && (
            <div className="space-y-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 max-h-12">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text" required={!isLogin} placeholder="Full Name"
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 max-h-12">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email" required placeholder="Email Address"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 max-h-12">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password" required placeholder="Password" minLength={8}
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button disabled={loading} type="submit" className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition ${isLogin ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-900'} mt-6`}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLogin ? 'Signing you in...' : 'Creating account...'}
              </>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <div className="my-6 flex items-center text-zinc-500 text-xs uppercase tracking-widest before:flex-1 before:border-t before:border-zinc-800 before:mr-4 after:flex-1 after:border-t after:border-zinc-800 after:ml-4">
            Or continue with
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={handleGoogle} type="button" className="flex items-center justify-center gap-2 py-2 px-4 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-white text-sm transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Google
             </button>
               <button onClick={handleGoogle} type="button" className="flex items-center justify-center gap-2 py-2 px-4 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-white text-sm transition">
                  <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
               </button>
          </div>

          <p className="text-center text-sm text-zinc-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 hover:text-white">
              {isLogin ? 'Create one' : 'Log in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

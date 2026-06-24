import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';

export type AdminRole = 'superadmin' | 'admin' | 'editor' | 'author';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  role: AdminRole | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkSessionToken = useCallback(async () => {
    const token = localStorage.getItem('admin_session');
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        setIsAdmin(true);
        return true;
      }
    } catch { /* ignore */ }
    localStorage.removeItem('admin_session');
    return false;
  }, []);

  useEffect(() => {
    let destroyed = false;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (destroyed) return;
      setUser(u);
      if (u) {
        try {
          const idTokenResult = await u.getIdTokenResult();
          const r = (idTokenResult.claims.role as AdminRole) || null;
          if (r && ['superadmin', 'admin', 'editor', 'author'].includes(r)) {
            setRole(r);
            setIsAdmin(true);
          } else {
            setRole(null);
            setIsAdmin(false);
          }
        } catch {
          setRole(null);
          setIsAdmin(false);
        }
      } else {
        const hasSession = await checkSessionToken();
        if (!hasSession) {
          setRole(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });
    return () => { destroyed = true; unsub(); };
  }, [checkSessionToken]);

  const login = async (email: string, password: string) => {
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Admin login response:", { ok: res.ok, sessionOnly: data.sessionOnly, role: data.role });
      if (!res.ok) {
        setError(data.error || 'Invalid admin credentials.');
        return;
      }
      if (data.sessionOnly) {
        localStorage.setItem('admin_session', data.token);
        setRole(data.role);
        setIsAdmin(true);
        try {
          await signInWithEmailAndPassword(auth, email, password);
          console.log("Admin signed in with email/password fallback");
        } catch (signInErr: any) {
          console.log("Email/password fallback failed:", signInErr.message);
          try { const u = auth.currentUser; if (u) { await signOut(auth); } } catch {}
        }
        return;
      }
      await signInWithCustomToken(auth, data.token);
      console.log("Admin signed in with custom token, role:", data.role);
      setRole(data.role);
      setIsAdmin(true);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const logout = async () => {
    localStorage.removeItem('admin_session');
    await signOut(auth);
    setIsAdmin(false);
    setRole(null);
    setUser(null);
  };

  return { user, isAdmin, role, loading, error, login, logout };
}

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';

export interface AdminSettings {
  pricing: { starter: number; standard: number; premium: number; currency: string };
  cta: { headline: string; subtitle: string; buttonText: string };
  seo: { siteTitle: string; metaDescription: string; ogImage: string };
  features: { enableBlog: boolean; enableGuides: boolean; enableSampleReport: boolean };
  branding: { siteName: string; logoUrl: string; faviconUrl: string };
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: { seconds: number } | string;
  createdBy?: string;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { user, role } = useAdminAuth();

  const isSuperAdmin = role === 'superadmin';

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (updates: Partial<AdminSettings>) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedBy: user?.email || 'admin' }),
      });
      if (res.ok) {
        setSettings(await res.json());
        return true;
      }
      const data = await res.json();
      setError(data.error || 'Failed to save settings');
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [isSuperAdmin]);

  const addUser = async (email: string, role: string) => {
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, createdBy: user?.email || 'admin' }),
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
      const data = await res.json();
      setError(data.error || 'Failed to add user');
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateUser = async (id: string, updates: { role?: string; status?: string }) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { if (isSuperAdmin) fetchUsers(); }, [isSuperAdmin, fetchUsers]);

  return {
    settings, loading, saving, error,
    users, usersLoading, isSuperAdmin,
    saveSettings, addUser, updateUser, deleteUser,
    fetchSettings, fetchUsers,
  };
}

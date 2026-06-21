import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield } from 'lucide-react';

interface AdminUser {
    id: number;
    email: string;
    role: string;
    createdAt: number;
}

export default function Users() {
    const [users, setUsers] = useState<AdminUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch('/api/auth/users');
            if (res.ok) {
                setUsers(await res.json());
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
                <UsersIcon className="text-indigo-400 w-8 h-8" /> System Users
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-800 text-zinc-300">
                        <tr>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Date Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-zinc-800 transition-colors">
                                <td className="p-4 font-medium text-white">{user.email}</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400">
                                        <Shield className="w-3 h-3" /> {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-zinc-400 font-mono text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-zinc-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

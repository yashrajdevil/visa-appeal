import { useEffect, useState } from 'react';

interface EnvVarDiag {
  name: string;
  raw: string;
  trimmed: string;
  length: number;
  trimmedLength: number;
  hasNewline: boolean;
  hasTrailingWhitespace: boolean;
  charCodes: number[];
}

export default function FirebaseDebug() {
  const [diag, setDiag] = useState<Record<string, EnvVarDiag> | null>(null);

  useEffect(() => {
    const d = (window as any).__FIREBASE_DIAG;
    setDiag(d || null);
  }, []);

  if (!diag) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Firebase Config Debug</h1>
        <p className="text-zinc-400">Diagnostics not available. __FIREBASE_DIAG is undefined.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-6">Firebase Config Debug</h1>
      <p className="text-zinc-400 mb-6">Values as received by the Vite bundle at build time.</p>

      {Object.entries(diag).map(([key, v]) => (
        <div key={key} className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <h2 className="text-lg font-bold text-indigo-400 mb-2">{v.name}</h2>
          <table className="w-full text-left">
            <tbody>
              <tr><td className="text-zinc-500 pr-4 py-1">Raw value:</td><td className="text-zinc-300 break-all">"{v.raw}"</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Trimmed:</td><td className="text-zinc-300 break-all">"{v.trimmed}"</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Raw length:</td><td className="text-zinc-300">{v.length}</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Trimmed length:</td><td className="text-zinc-300">{v.trimmedLength}</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Has newline (\\n/\\r):</td><td className={v.hasNewline ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{String(v.hasNewline)}</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Trailing whitespace:</td><td className={v.hasTrailingWhitespace ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{String(v.hasTrailingWhitespace)}</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Char codes:</td><td className="text-zinc-300 text-xs break-all">[{v.charCodes.join(', ')}]</td></tr>
              <tr><td className="text-zinc-500 pr-4 py-1">Last 5 codes:</td><td className="text-zinc-300">[{v.charCodes.slice(-5).join(', ')}]</td></tr>
            </tbody>
          </table>
          {v.hasNewline && (
            <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs">
              WARNING: This env var contains a newline character! This will break Firebase Auth if not trimmed.
            </div>
          )}
          {v.hasTrailingWhitespace && !v.hasNewline && (
            <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs">
              WARNING: This env var has trailing whitespace (length {v.length} vs trimmed {v.trimmedLength}).
            </div>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h2 className="text-lg font-bold text-emerald-400 mb-2">authDomain Passed to Firebase SDK</h2>
        <p className="text-zinc-300 break-all">"{diag.authDomain.trimmed}"</p>
        <p className="text-zinc-500 text-xs mt-1">Length: {diag.authDomain.trimmedLength}</p>
      </div>
    </div>
  );
}

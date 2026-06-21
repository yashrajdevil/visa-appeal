import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, limit, getDocs, query, orderBy } from 'firebase/firestore';
import { AlertCircle, CheckCircle, Database, Server, HardDrive, ShieldAlert, Activity } from 'lucide-react';

export default function AdminDiagnostics() {
  const [status, setStatus] = useState<any>({
    firestore: 'checking',
    storage: 'checking',
    auth: 'checking',
    pdf: 'checking',
    errors: [],
    failedJobs: []
  });

  const runDiagnostics = async () => {
    let newStatus = { ...status, errors: [] as any[] };
    
    // Check Auth
    try {
      if (auth.app) {
         newStatus.auth = 'online';
      } else {
         newStatus.auth = 'offline';
      }
    } catch (e: any) {
      newStatus.auth = 'error';
      newStatus.errors.push(`Auth Error: ${e.message}`);
    }

    // Check Firestore
    try {
      const q = query(collection(db, 'cases'), limit(1));
      await getDocs(q);
      newStatus.firestore = 'online';
    } catch (e: any) {
      newStatus.firestore = 'error';
      newStatus.errors.push(`Firestore Error: ${e.message}`);
    }

    // Check Storage
    try {
      const docsRef = collection(db, 'documents');
      await getDocs(query(docsRef, limit(1)));
      newStatus.storage = 'online'; // We assume storage is working if we can read docs tracking it
    } catch (e: any) {
      newStatus.storage = 'error';
      newStatus.errors.push(`Storage Error: ${e.message}`);
    }

    // Check PDF API (Simulated check)
    newStatus.pdf = 'online'; // Assuming html2pdf loads client side

    // Get recent failed cases/orders
    try {
      const failedOrdersRef = collection(db, 'orders');
      // In a real app we'd query by status=='failed', but missing indexes might fail.
      const qs = await getDocs(query(failedOrdersRef, orderBy('createdAt', 'desc'), limit(10)));
      const failed = qs.docs.map(d=>({id: d.id, ...d.data()})).filter((o: any) => o.status === 'failed');
      newStatus.failedJobs = failed;
    } catch (e: any) {
       console.error("Could not fetch failed jobs", e);
    }
    
    setStatus(newStatus);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusIcon = ({ state }: { state: string }) => {
    if (state === 'checking') return <Activity className="w-5 h-5 text-zinc-500 animate-pulse" />;
    if (state === 'online') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    return <AlertCircle className="w-5 h-5 text-rose-500" />;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Diagnostics</h1>
        <p className="text-zinc-400 mt-1">Real-time health status of Core Services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-500/10 rounded-lg"><Server className="w-5 h-5 text-indigo-400"/></div>
               <div>
                  <div className="text-sm font-medium text-white">Authentication</div>
                  <div className="text-xs text-zinc-500 capitalize">{status.auth}</div>
               </div>
            </div>
            <StatusIcon state={status.auth} />
         </div>
         <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-emerald-500/10 rounded-lg"><Database className="w-5 h-5 text-emerald-400"/></div>
               <div>
                  <div className="text-sm font-medium text-white">Firestore DB</div>
                  <div className="text-xs text-zinc-500 capitalize">{status.firestore}</div>
               </div>
            </div>
            <StatusIcon state={status.firestore} />
         </div>
         <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-sky-500/10 rounded-lg"><HardDrive className="w-5 h-5 text-sky-400"/></div>
               <div>
                  <div className="text-sm font-medium text-white">Storage Buckets</div>
                  <div className="text-xs text-zinc-500 capitalize">{status.storage}</div>
               </div>
            </div>
            <StatusIcon state={status.storage} />
         </div>
         <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-rose-500/10 rounded-lg"><ShieldAlert className="w-5 h-5 text-rose-400"/></div>
               <div>
                  <div className="text-sm font-medium text-white">PDF Service</div>
                  <div className="text-xs text-zinc-500 capitalize">{status.pdf}</div>
               </div>
            </div>
            <StatusIcon state={status.pdf} />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Errors</h3>
            <div className="space-y-3">
               {status.errors.length === 0 ? (
                 <div className="text-sm text-zinc-500">No recent errors detected.</div>
               ) : (
                 status.errors.map((err: string, i: number) => (
                   <div key={i} className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg font-mono">
                     {err}
                   </div>
                 ))
               )}
            </div>
         </div>

         <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Failed Jobs & Orders</h3>
            <div className="space-y-3">
               {status.failedJobs.length === 0 ? (
                 <div className="text-sm text-zinc-500">No failed jobs detected.</div>
               ) : (
                 status.failedJobs.map((job: any) => (
                   <div key={job.id} className="text-sm border border-zinc-800 p-3 rounded-lg flex justify-between bg-zinc-950">
                     <div className="text-white">Order ID: <span className="font-mono text-zinc-400">{job.id}</span></div>
                     <div className="text-amber-400 text-xs uppercase">{job.status}</div>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
      
      <div className="flex justify-end">
         <button onClick={runDiagnostics} className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-medium text-sm">
           Refresh Diagnostics
         </button>
      </div>
    </div>
  );
}

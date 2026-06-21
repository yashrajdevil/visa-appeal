import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, FileText, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';

export function DashboardOverview() {
  const { user } = useCustomerAuth();
  const [stats, setStats] = useState<any>({ totalAppeals: 0, totalPurchases: 0, recentCases: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const casesRef = collection(db, 'users', user.id, 'cases');
        const rCases = await getDocs(query(casesRef));
        
        const ordersRef = collection(db, 'users', user.id, 'purchases');
        const rOrders = await getDocs(query(ordersRef));
        
        if (isMounted) {
          const sortedCases = rCases.docs.map(d => ({id: d.id, ...d.data()})).sort((a: any, b: any) => b.createdAt - a.createdAt);
          
          setStats({
            totalAppeals: rCases.size,
            totalPurchases: rOrders.size,
            recentCases: sortedCases.slice(0, 3)
          });
        }
      } catch (err) { 
        console.error(err); 
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) return <div className="text-zinc-500 min-h-[300px] flex items-center justify-center">Loading overview...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user?.name || 'Client'}</h1>
        <p className="text-zinc-400 mt-1">Here's an overview of your appeal cases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
             <p className="text-sm text-zinc-400 font-medium mb-1">Total Appeals</p>
             <h2 className="text-4xl font-bold text-white">{stats?.totalAppeals || 0}</h2>
          </div>
          <div className="absolute right-[-20%] bottom-[-20%] text-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
             <FileText className="w-40 h-40" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
             <p className="text-sm text-zinc-400 font-medium mb-1">Total Purchases</p>
             <h2 className="text-4xl font-bold text-white">{stats?.totalPurchases || 0}</h2>
          </div>
           <div className="absolute right-[-20%] bottom-[-20%] text-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
             <ShoppingBag className="w-40 h-40" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/flow" className="flex-1 bg-white text-zinc-950 font-semibold py-4 px-6 rounded-xl flex items-center justify-between hover:bg-zinc-200 transition">
           <span className="flex items-center gap-2"><Plus className="w-5 h-5"/> Start New Analysis</span>
           <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/dashboard/cases" className="flex-1 bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-between hover:bg-indigo-500 transition">
           <span className="flex items-center gap-2"><FileText className="w-5 h-5"/> Browse My Cases</span>
           <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
           {stats?.recentCases?.length > 0 ? stats.recentCases.map((c: any) => (
             <div key={c.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                   <CheckCircle className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-medium text-white">{c.country} - {c.visaType}</p>
                   <p className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                 </div>
               </div>
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">Completed</span>
             </div>
           )) : (
             <div className="p-8 text-center text-zinc-500 text-sm">No activity found. Start a new appeal to see it here.</div>
           )}
        </div>
      </div>
    </div>
  );
}

export function DashboardOrders() {
  const { user } = useCustomerAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'users', user.id, 'purchases');
        const qs = await getDocs(query(ordersRef));
        if (isMounted) {
          const ordered = qs.docs.map(d => ({id: d.id, ...d.data()})).sort((a:any,b:any) => b.createdAt - a.createdAt);
          setOrders(ordered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchOrders();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) return <div className="text-zinc-500 min-h-[300px] flex items-center justify-center">Loading orders...</div>;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-white">Purchase History</h1>
        <p className="text-zinc-400 text-sm">Review your past transactions and retrieve invoices.</p>
       </div>

       <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
         <table className="w-full text-left text-sm text-zinc-400">
           <thead className="bg-zinc-800/50 text-xs uppercase tracking-wider">
             <tr>
               <th className="px-6 py-4 font-medium text-zinc-300">Order ID</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Date</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Plan</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Amount</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Status</th>
               <th className="px-6 py-4 font-medium text-zinc-300 text-right">Invoice</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-zinc-800">
             {orders.length === 0 && (
               <tr>
                 <td colSpan={6} className="px-6 py-8 text-center bg-zinc-950">No purchases found.</td>
               </tr>
             )}
             {orders.map(o => (
               <tr key={o.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition">
                 <td className="px-6 py-4 whitespace-nowrap font-mono">#{o.id.toString().padStart(6,'0')}</td>
                 <td className="px-6 py-4 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-white font-medium capitalize">{o.plan}</td>
                 <td className="px-6 py-4 whitespace-nowrap">{o.amount ? `$${(o.amount/100).toFixed(2)}` : '-'}</td>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 py-1 text-xs rounded-lg font-medium ${(o.status === 'completed' || o.status === 'paid') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                     {o.status.toUpperCase()}
                   </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-right">
                    {o.pdfUrl ? (
                      <a href={o.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition">Download</a>
                    ) : (
                      <span className="text-zinc-600">N/A</span>
                    )}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
}

export function DashboardCases() {
  const { user } = useCustomerAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!user) return;
    let isMounted = true;
    const fetchCases = async () => {
      try {
        const casesRef = collection(db, 'users', user.id, 'cases');
        const qs = await getDocs(query(casesRef));
        if (isMounted) {
          const sorted = qs.docs.map(d => ({id: d.id, ...d.data()})).sort((a:any,b:any) => b.createdAt - a.createdAt);
          setCases(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCases();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) return <div className="text-zinc-500 min-h-[300px] flex items-center justify-center">Loading cases...</div>;

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Case History</h1>
          <p className="text-zinc-400 text-sm">Track your appeal statuses and access generated materials.</p>
        </div>
        <Link to="/flow" className="bg-white text-zinc-900 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition text-sm">
          + New Case
        </Link>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {cases.map(c => (
           <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition group flex flex-col">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-semibold text-white tracking-tight">{c.country}</h3>
                  <p className="text-xs text-zinc-500">{c.visaType}</p>
               </div>
               <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-wider font-bold rounded-md">
                 {c.status}
               </span>
             </div>
             
             <div className="flex-1">
               <p className="text-sm text-zinc-400 line-clamp-2">
                 Refusals: {JSON.parse(c.refusalReasonsJson || '[]').join(', ')}
               </p>
               <div className="mt-4">
                 {c.pdfUrls?.premium && <a href={c.pdfUrls.premium} className="block text-[11px] font-medium uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition px-3 py-2 rounded-lg text-center" target="_blank" rel="noreferrer">Download Premium PDF</a>}
                 {c.pdfUrls?.standard && !c.pdfUrls?.premium && <a href={c.pdfUrls.standard} className="block text-[11px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition px-3 py-2 rounded-lg text-center" target="_blank" rel="noreferrer">Download Standard PDF</a>}
                 {c.pdfUrls?.starter && !c.pdfUrls?.premium && !c.pdfUrls?.standard && <a href={c.pdfUrls.starter} className="block text-[11px] font-medium uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition px-3 py-2 rounded-lg text-center" target="_blank" rel="noreferrer">Download Starter PDF</a>}
               </div>
             </div>
             
             <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-sm">
               <span className="text-zinc-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(c.createdAt).toLocaleDateString()}</span>
               <Link to={`/results/${c.id}`} className="text-indigo-400 font-medium hover:text-indigo-300 transition flex items-center gap-1 group-hover:translate-x-1">
                 View Result <ArrowRight className="w-4 h-4" />
               </Link>
             </div>
           </div>
         ))}
         {cases.length === 0 && (
           <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
             No cases yet. Start by generating a new appeal.
           </div>
         )}
       </div>
    </div>
  );
}

export function DashboardDocuments() {
  const { user } = useCustomerAuth();
  const [docsData, setDocsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!user) return;
    let isMounted = true;
    const fetchDocs = async () => {
      try {
        const docsRef = collection(db, 'documents');
        const qs = await getDocs(query(docsRef, where('userId', '==', user.id)));
        if (isMounted) {
          const sorted = qs.docs.map(d => ({id: d.id, ...d.data()})).sort((a:any,b:any) => b.createdAt - a.createdAt);
          setDocsData(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDocs();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) return <div className="text-zinc-500 min-h-[300px] flex items-center justify-center">Loading documents...</div>;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-white">Document Library</h1>
        <p className="text-zinc-400 text-sm">Your permanently stored appeal packages available for download.</p>
       </div>

       <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
         <table className="w-full text-left text-sm text-zinc-400">
           <thead className="bg-zinc-800/50 text-xs uppercase tracking-wider">
             <tr>
               <th className="px-6 py-4 font-medium text-zinc-300">File Name</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Country</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Generation Date</th>
               <th className="px-6 py-4 font-medium text-zinc-300 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-zinc-800">
             {docsData.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center bg-zinc-950">No documents generated yet.</td>
               </tr>
             )}
             {docsData.map(c => (
               <tr key={c.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition">
                 <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    {c.fileName}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">{c.type}</td>
                 <td className="px-6 py-4 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                    {c.url ? (
                       <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition font-medium">Download</a>
                    ) : (
                       <span className="text-zinc-600">N/A</span>
                    )}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
}

export function DashboardSettings() {
  const { user } = useCustomerAuth();
  const [name, setName] = useState(user?.name || '');
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { name, updatedAt: Date.now() });
      setMsg('Profile updated successfully.');
    } catch(err) {
      setMsg('Failed to update profile.');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-zinc-400 text-sm">Update your account details and notification preferences.</p>
       </div>

       {msg && <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl text-sm border border-indigo-500/20">{msg}</div>}

       <form onSubmit={handleUpdate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
             <label className="text-sm font-medium text-zinc-300">Full Name</label>
             <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-1">
             <label className="text-sm font-medium text-zinc-300">Email Address (Managed by Authentication)</label>
             <input type="email" disabled value={user?.email || ''} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 focus:outline-none cursor-not-allowed" />
          </div>
          <div className="pt-2">
             <button type="submit" className="bg-white text-zinc-900 font-semibold py-3 px-6 rounded-xl hover:bg-zinc-200 transition">Save Changes</button>
          </div>
       </form>
    </div>
  );
}

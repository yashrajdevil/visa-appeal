import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Plus, ArrowRight, FileText, ShoppingBag, CheckCircle, Clock } from 'lucide-react';

interface CaseItem {
  caseId: string;
  country: string;
  visaType: string;
  paymentStatus: string;
  purchasedPlan: string;
  createdAt: any;
  analysisData?: any;
}

export function DashboardOverview() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'cases'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: CaseItem[] = [];
      snap.forEach(doc => items.push(doc.data() as CaseItem));
      setCases(items);
      setLoading(false);
    });

    return unsub;
  }, []);

  const totalPurchases = cases.filter(c => c.paymentStatus === 'completed').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Welcome to your Visa Appeal dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
             <p className="text-sm text-zinc-400 font-medium mb-1">Total Appeals</p>
             <h2 className="text-4xl font-bold text-white">{cases.length}</h2>
          </div>
          <div className="absolute right-[-20%] bottom-[-20%] text-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
             <FileText className="w-40 h-40" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
             <p className="text-sm text-zinc-400 font-medium mb-1">Total Purchases</p>
             <h2 className="text-4xl font-bold text-white">{totalPurchases}</h2>
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
        <Link to="/flow" className="flex-1 bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-between hover:bg-indigo-500 transition">
           <span className="flex items-center gap-2"><FileText className="w-5 h-5"/> Generate Appeal</span>
           <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
          {cases.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No activity found. Start a new appeal to see it here.</div>
          ) : (
            cases.slice(0, 5).map((c) => (
              <Link key={c.caseId} to={`/results/${c.caseId}`} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-white font-medium">{c.country} - {c.visaType}</p>
                    <p className="text-xs text-zinc-500">
                      {c.paymentStatus === 'completed' ? 'Purchased' : c.paymentStatus === 'pending' ? 'Payment pending' : 'Unlocked'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardOrders() {
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'cases'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: CaseItem[] = [];
      snap.forEach(doc => items.push(doc.data() as CaseItem));
      setCases(items);
    });
    return unsub;
  }, []);

  const purchases = cases.filter(c => c.paymentStatus === 'completed');

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
               <th className="px-6 py-4 font-medium text-zinc-300">Case</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Date</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Plan</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-zinc-800">
             {purchases.length === 0 ? (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center bg-zinc-950">No purchases found.</td>
               </tr>
             ) : (
               purchases.map((c) => (
                 <tr key={c.caseId} className="hover:bg-zinc-800/30">
                   <td className="px-6 py-4 text-zinc-200">{c.country} - {c.visaType}</td>
                   <td className="px-6 py-4 text-zinc-400">{c.createdAt?.toDate?.()?.toLocaleDateString?.() || '-'}</td>
                   <td className="px-6 py-4 capitalize">{c.purchasedPlan}</td>
                   <td className="px-6 py-4"><span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Completed</span></td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
    </div>
  );
}

export function DashboardCases() {
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'cases'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: CaseItem[] = [];
      snap.forEach(doc => items.push(doc.data() as CaseItem));
      setCases(items);
    });
    return unsub;
  }, []);

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
         {cases.length === 0 ? (
           <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
             No cases yet. Start by generating a new appeal.
           </div>
         ) : (
           cases.map((c) => (
             <Link key={c.caseId} to={`/results/${c.caseId}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/30 transition group">
               <div className="flex items-start justify-between mb-4">
                 <div>
                   <h3 className="text-white font-semibold">{c.country}</h3>
                   <p className="text-sm text-zinc-400">{c.visaType}</p>
                 </div>
                 {c.paymentStatus === 'completed' ? (
                   <CheckCircle className="w-5 h-5 text-emerald-400" />
                 ) : (
                   <Clock className="w-5 h-5 text-amber-400" />
                 )}
               </div>
               <div className="flex items-center text-sm text-zinc-500">
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 <span className="ml-1">View Details</span>
               </div>
             </Link>
           ))
         )}
       </div>
    </div>
  );
}

export function DashboardDocuments() {
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'cases'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: CaseItem[] = [];
      snap.forEach(doc => items.push(doc.data() as CaseItem));
      setCases(items);
    });
    return unsub;
  }, []);

  const purchased = cases.filter(c => c.paymentStatus === 'completed');

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
               <th className="px-6 py-4 font-medium text-zinc-300">Case</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Country</th>
               <th className="px-6 py-4 font-medium text-zinc-300">Plan</th>
               <th className="px-6 py-4 font-medium text-zinc-300 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-zinc-800">
             {purchased.length === 0 ? (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center bg-zinc-950">No documents generated yet.</td>
               </tr>
             ) : (
               purchased.map((c) => (
                 <tr key={c.caseId} className="hover:bg-zinc-800/30">
                   <td className="px-6 py-4 text-zinc-200">{c.caseId.slice(0, 8)}...</td>
                   <td className="px-6 py-4">{c.country}</td>
                   <td className="px-6 py-4 capitalize">{c.purchasedPlan}</td>
                   <td className="px-6 py-4 text-right">
                     <Link to={`/results/${c.caseId}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">View</Link>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
    </div>
  );
}

export function DashboardSettings() {
  return (
    <div className="max-w-2xl space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-zinc-400 text-sm">Update your account details and notification preferences.</p>
       </div>

       <form className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
             <label className="text-sm font-medium text-zinc-300">Full Name</label>
             <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-1">
             <label className="text-sm font-medium text-zinc-300">Email Address</label>
             <input type="email" disabled className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 focus:outline-none cursor-not-allowed" />
          </div>
       </form>
    </div>
  );
}

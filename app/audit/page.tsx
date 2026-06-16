// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import api from '@/lib/api';
// import PageLayout from '@/components/PageLayout';

// interface AuditLog {
//   id: string; userEmail: string; userRole: string; action: string;
//   entityType: string; entityId: string; ipAddress: string;
//   isSuccess: boolean; failureReason: string; timestamp: string;
// }

// interface LoginAttempt {
//   id: string; email: string; isSuccess: boolean;
//   ipAddress: string; failureReason: string; attemptedAt: string;
// }

// export default function AuditPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [logs, setLogs] = useState<AuditLog[]>([]);
//   const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const [activeTab, setActiveTab] = useState<'actions' | 'logins'>('actions');

//   const fetchAll = useCallback(async () => {
//     try {
//       const [lRes, aRes] = await Promise.all([
//         api.get('/auditlogs'),
//         api.get('/auditlogs/login-attempts'),
//       ]);
//       setLogs(lRes.data); setAttempts(aRes.data);
//     } catch { } finally { setLoading(false); }
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       setMounted(true);
//       if (!user) { router.push('/login'); return; }
//       if (user.role !== 'Admin') { router.push('/dashboard'); return; }
//       fetchAll();
//     }, 0);
//     return () => clearTimeout(t);
//   }, [user, router, fetchAll]);

//   if (!mounted || !user) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//       <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
//     </div>
//   );

//   const failedLogins = attempts.filter(a => !a.isSuccess).length;

//   return (
//     <PageLayout title="Audit Logs" subtitle="Security and activity monitoring">
//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           { label: 'Total Actions', value: logs.length, icon: 'history' },
//           { label: 'Login Attempts', value: attempts.length, icon: 'login' },
//           { label: 'Failed Logins', value: failedLogins, icon: 'warning' },
//         ].map((s, i) => (
//           <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
//             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
//               <span className="material-symbols-outlined text-blue-600 text-[20px]">{s.icon}</span>
//             </div>
//             <div>
//               <p className="text-xl font-bold text-slate-900">{s.value}</p>
//               <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">{s.label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-4">
//         {[
//           { key: 'actions', label: 'Action Logs' },
//           { key: 'logins', label: 'Login Attempts' },
//         ].map(tab => (
//           <button key={tab.key} onClick={() => setActiveTab(tab.key as 'actions' | 'logins')}
//             className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase border transition-all ${
//               activeTab === tab.key
//                 ? 'bg-blue-700 text-white border-blue-700'
//                 : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300'
//             }`}>
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div className="bg-white border border-slate-200 rounded-xl">
//           {[...Array(8)].map((_, i) => <div key={i} className="h-12 border-b border-slate-100 animate-pulse bg-slate-50" />)}
//         </div>
//       ) : activeTab === 'actions' ? (
//         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200">
//                 {['User','Role','Action','Entity','IP Address','Status','Timestamp'].map(h => (
//                   <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {logs.length === 0 ? (
//                 <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No audit logs yet</td></tr>
//               ) : logs.map((l, i) => (
//                 <tr key={l.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
//                   <td className="px-4 py-3 text-[12px] font-semibold text-slate-800">{l.userEmail}</td>
//                   <td className="px-4 py-3 text-[12px] text-slate-600">{l.userRole}</td>
//                   <td className="px-4 py-3">
//                     <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
//                       {l.action}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-[12px] text-slate-600">{l.entityType}</td>
//                   <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{l.ipAddress || '—'}</td>
//                   <td className="px-4 py-3">
//                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${l.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                       {l.isSuccess ? '✓ Success' : '✕ Failed'}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
//                     {new Date(l.timestamp).toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
//           <table className="w-full text-left border-separate border-spacing-y-5">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200">
//                 {['Email','IP Address','Result','Reason','Timestamp'].map(h => (
//                   <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {attempts.length === 0 ? (
//                 <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No login attempts recorded</td></tr>
//               ) : attempts.map((a, i) => (
//                 <tr key={a.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
//                   <td className="px-4 py-3 text-[12px] font-semibold text-slate-800">{a.email}</td>
//                   <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{a.ipAddress || '—'}</td>
//                   <td className="px-4 py-3">
//                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${a.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                       {a.isSuccess ? '✓ Success' : '✕ Failed'}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-[12px] text-slate-500">{a.failureReason || '—'}</td>
//                   <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
//                     {new Date(a.attemptedAt).toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </PageLayout>
//   );
// }




'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PageLayout from '@/components/PageLayout';

interface AuditLog {
  id: string; userEmail: string; userRole: string; action: string;
  entityType: string; entityId: string; ipAddress: string;
  isSuccess: boolean; failureReason: string; timestamp: string;
}

interface LoginAttempt {
  id: string; email: string; isSuccess: boolean;
  ipAddress: string; failureReason: string; attemptedAt: string;
}

export default function AuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'logins'>('actions');

  const fetchAll = useCallback(async () => {
    try {
      // Dono calls ko individual handle kiya taaki controller na hone par frontend crash na kare
      const [lRes, aRes] = await Promise.allSettled([
        api.get('/AuditLogs'),
        api.get('/AuditLogs/login-attempts'),
      ]);

      if (lRes.status === 'fulfilled') setLogs(lRes.value.data || []);
      if (aRes.status === 'fulfilled') setAttempts(aRes.value.data || []);

    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (!user) { router.push('/login'); return; }
      if (user.role !== 'Admin') { router.push('/dashboard'); return; }
      fetchAll();
    }, 0);
    return () => clearTimeout(t);
  }, [user, router, fetchAll]);

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const failedLogins = attempts.filter(a => !a.isSuccess).length;

  return (
    <PageLayout title="Audit Logs" subtitle="Security and activity monitoring">

      {/* Cards layout jahan text overlap ho raha tha use absolute-fix kiya */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Actions', value: logs.length, icon: '📜' },
          { label: 'Login Attempts', value: attempts.length, icon: '🔐' },
          { label: 'Failed Logins', value: failedLogins, icon: '🚨' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-md shadow-xl p-5  items-center gap-4 shadow-sm min-w-0">
            <div className="w-10 h-20 rounded-lg bg-blue-50 flex items-center justify-center ">
              <span className=" text-blue-600 text-xl">{s.icon}</span>

              <div className="flex flex-col ga-2 min-w-0">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">{s.value}</span>
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-2 whitespace-nowrap block">{s.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
        {/* Tabs Layout */}
        <div className="flex gap-4 mb-4">
          {[
            { key: 'actions', label: 'Action Logs' },
            { key: 'logins', label: 'Login Attempts' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as 'actions' | 'logins')}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase border transition-all ${activeTab === tab.key
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 border-b border-slate-100 animate-pulse bg-slate-50" />)}
          </div>
        ) : activeTab === 'actions' ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['User', 'Role', 'Action', 'Entity', 'IP Address', 'Status', 'Timestamp'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No audit logs found. Ensure AuditLogsController exists on backend.</td></tr>
                  ) : logs.map((l, i) => (
                    <tr key={l.id} className={`hover:bg-blue-50/20 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-800 whitespace-nowrap">{l.userEmail}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 whitespace-nowrap">{l.userRole}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                          {l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 whitespace-nowrap">{l.entityType}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{l.ipAddress || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${l.isSuccess ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {l.isSuccess ? '✓ Success' : '✕ Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Email', 'IP Address', 'Result', 'Reason', 'Timestamp'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No login attempts recorded.</td></tr>
                  ) : attempts.map((a, i) => (
                    <tr key={a.id} className={`hover:bg-blue-50/20 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-800 whitespace-nowrap">{a.email}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{a.ipAddress || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${a.isSuccess ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {a.isSuccess ? '✓ Success' : '✕ Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-500 max-w-[200px] truncate whitespace-nowrap" title={a.failureReason || ''}>
                        {a.failureReason || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(a.attemptedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      
      )}
    </PageLayout>
  );
}
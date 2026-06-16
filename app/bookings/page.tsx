// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import api from '@/lib/api';
// import PageLayout from '@/components/PageLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// interface Booking {
//   id: string; shipName: string; imoNumber: string; requesterName: string;
//   departurePort: string; arrivalPort: string;
//   plannedDeparture: string; plannedArrival: string;
//   purpose: string; cargoWeightMT: number; cargoDescription: string;
//   status: string; rejectionReason: string; approvedAt: string; createdAt: string;
// }
// interface Ship { id: string; name: string; imoNumber: string; status: string; }
// interface Port { id: string; name: string; code: string; }
// interface Captain { id: string; fullName: string; licenseNumber: string; isAvailable: boolean; }

// const STATUS_BADGE: Record<string, string> = {
//   Pending:   'bg-yellow-100 text-yellow-800',
//   Approved:  'bg-blue-100 text-blue-800',
//   Rejected:  'bg-red-100 text-red-800',
//   UnderWay:  'bg-purple-100 text-purple-800',
//   Completed: 'bg-green-100 text-green-800',
//   Cancelled: 'bg-slate-100 text-slate-600',
// };

// const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';
// const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

// export default function BookingsPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [ships, setShips] = useState<Ship[]>([]);
//   const [ports, setPorts] = useState<Port[]>([]);
//   const [captains, setCaptains] = useState<Captain[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const [showAdd, setShowAdd] = useState(false);
//   const [approveId, setApproveId] = useState('');
//   const [rejectId, setRejectId] = useState('');
//   const [selectedCaptain, setSelectedCaptain] = useState('');
//   const [rejectReason, setRejectReason] = useState('');
//   const [success, setSuccess] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState({
//     shipId: '', departurePortId: '', arrivalPortId: '',
//     plannedDeparture: '', plannedArrival: '',
//     purpose: '', cargoWeightMT: '', cargoDescription: '',
//   });

//   const isManager = user?.role === 'Admin' || user?.role === 'FleetManager';
//   const pending = bookings.filter(b => b.status === 'Pending');

//   const fetchAll = useCallback(async () => {
//     try {
//       const [bRes, sRes, pRes] = await Promise.all([api.get('/bookings'), api.get('/ships'), api.get('/ports')]);
//       setBookings(bRes.data);
//       setShips(sRes.data.filter((s: Ship) => s.status === 'InPort' || s.status === 'Anchored'));
//       setPorts(pRes.data);
//       if (isManager) {
//         const cRes = await api.get('/captains');
//         setCaptains(cRes.data.filter((c: Captain) => c.isAvailable));
//       }
//     } catch { } finally { setLoading(false); }
//   }, [isManager]);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       setMounted(true);
//       if (!user) { router.push('/login'); return; }
//       fetchAll();
//     }, 0);
//     return () => clearTimeout(t);
//   }, [user, router, fetchAll]);

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     try {
//       await api.post('/bookings', { ...form, cargoWeightMT: form.cargoWeightMT ? parseFloat(form.cargoWeightMT) : null });
//       setSuccess('Booking submitted!'); setShowAdd(false); fetchAll();
//       setTimeout(() => setSuccess(''), 3000);
//     } catch { } finally { setSubmitting(false); }
//   };

//   const handleApprove = async () => {
//     if (!selectedCaptain) return;
//     setSubmitting(true);
//     try {
//       await api.post(`/bookings/${approveId}/approve`, { captainId: selectedCaptain });
//       setSuccess('Booking approved!'); setApproveId(''); setSelectedCaptain(''); fetchAll();
//       setTimeout(() => setSuccess(''), 3000);
//     } catch { } finally { setSubmitting(false); }
//   };

//   const handleReject = async () => {
//     setSubmitting(true);
//     try {
//       await api.post(`/bookings/${rejectId}/reject`, { rejectionReason: rejectReason });
//       setSuccess('Booking rejected.'); setRejectId(''); setRejectReason(''); fetchAll();
//       setTimeout(() => setSuccess(''), 3000);
//     } catch { } finally { setSubmitting(false); }
//   };

//   if (!mounted || !user) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//       <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
//     </div>
//   );

//   const BookingRow = ({ b }: { b: Booking }) => (
//     <tr className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
//       <td className="px-4 py-3">
//         <p className="text-sm font-bold text-slate-900">{b.shipName}</p>
//         <p className="text-[11px] font-mono text-slate-400">{b.imoNumber}</p>
//       </td>
//       <td className="px-4 py-3 text-sm text-slate-600">{b.requesterName}</td>
//       <td className="px-4 py-3">
//         <p className="text-[12px] font-semibold text-slate-700">{b.departurePort}</p>
//         <p className="text-[10px] text-slate-400">→ {b.arrivalPort}</p>
//       </td>
//       <td className="px-4 py-3">
//         <p className="text-[11px] font-mono text-slate-600">{new Date(b.plannedDeparture).toLocaleDateString()}</p>
//         <p className="text-[11px] font-mono text-slate-400">{new Date(b.plannedArrival).toLocaleDateString()}</p>
//       </td>
//       <td className="px-4 py-3 text-[12px] text-slate-600 max-w-[150px] truncate">{b.purpose}</td>
//       <td className="px-4 py-3">
//         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${STATUS_BADGE[b.status]}`}>
//           {b.status}
//         </span>
//         {b.rejectionReason && <p className="text-[10px] text-red-500 mt-1">{b.rejectionReason}</p>}
//       </td>
//       {isManager && (
//         <td className="px-4 py-3">
//           {b.status === 'Pending' && (
//             <div className="flex gap-2">
//               <button onClick={() => setApproveId(b.id)}
//                 className="text-[10px] font-bold uppercase tracking-wider text-green-700 hover:text-green-900 transition-colors">
//                 Approve
//               </button>
//               <button onClick={() => setRejectId(b.id)}
//                 className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">
//                 Reject
//               </button>
//             </div>
//           )}
//         </td>
//       )}
//     </tr>
//   );

//   return (
//     <PageLayout title="Bookings" subtitle={`${pending.length} pending approval`}
//       pendingBookings={pending.length}
//       actions={
//         <Dialog open={showAdd} onOpenChange={setShowAdd}>
//           <DialogTrigger asChild>
//             <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
//               + New Request
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
//             <DialogHeader>
//               <DialogTitle className="text-slate-900 font-bold">New Voyage Booking</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-3 mt-2">
//               <div className="space-y-1.5">
//                 <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Vessel</Label>
//                 <Select value={form.shipId} onValueChange={v => setForm(p => ({ ...p, shipId: v }))}>
//                   <SelectTrigger className={sel}><SelectValue placeholder="Select vessel" /></SelectTrigger>
//                   <SelectContent className="bg-white border-slate-200 text-slate-800">
//                     {ships.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.imoNumber})</SelectItem>)}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">From Port</Label>
//                   <Select value={form.departurePortId} onValueChange={v => setForm(p => ({ ...p, departurePortId: v }))}>
//                     <SelectTrigger className={sel}><SelectValue placeholder="Select" /></SelectTrigger>
//                     <SelectContent className="bg-white border-slate-200 text-slate-800">
//                       {ports.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">To Port</Label>
//                   <Select value={form.arrivalPortId} onValueChange={v => setForm(p => ({ ...p, arrivalPortId: v }))}>
//                     <SelectTrigger className={sel}><SelectValue placeholder="Select" /></SelectTrigger>
//                     <SelectContent className="bg-white border-slate-200 text-slate-800">
//                       {ports.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Departure</Label>
//                   <Input type="datetime-local" value={form.plannedDeparture}
//                     onChange={e => setForm(p => ({ ...p, plannedDeparture: e.target.value }))} className={inp} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Arrival</Label>
//                   <Input type="datetime-local" value={form.plannedArrival}
//                     onChange={e => setForm(p => ({ ...p, plannedArrival: e.target.value }))} className={inp} />
//                 </div>
//               </div>
//               <div className="space-y-1.5">
//                 <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Purpose</Label>
//                 <Input placeholder="Cargo delivery, supply run..." value={form.purpose}
//                   onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className={inp} />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cargo (MT)</Label>
//                   <Input type="number" placeholder="0" value={form.cargoWeightMT}
//                     onChange={e => setForm(p => ({ ...p, cargoWeightMT: e.target.value }))} className={inp} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cargo Type</Label>
//                   <Input placeholder="Electronics, steel..." value={form.cargoDescription}
//                     onChange={e => setForm(p => ({ ...p, cargoDescription: e.target.value }))} className={inp} />
//                 </div>
//               </div>
//               <Button onClick={handleSubmit} disabled={submitting}
//                 className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold mt-2">
//                 {submitting ? 'Submitting...' : 'Submit Booking Request'}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       }
//     >
//       {success && (
//         <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>
//       )}

//       <Tabs defaultValue="pending" className="space-y-4">
//         <TabsList className="bg-white border border-slate-200 p-1 rounded-lg">
//           <TabsTrigger value="pending" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-slate-500 rounded-md text-[11px] font-bold tracking-wider uppercase">
//             Pending ({pending.length})
//           </TabsTrigger>
//           <TabsTrigger value="all" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-slate-500 rounded-md text-[11px] font-bold tracking-wider uppercase">
//             All ({bookings.length})
//           </TabsTrigger>
//         </TabsList>

//         {(['pending', 'all'] as const).map(tab => (
//           <TabsContent key={tab} value={tab}>
//             {loading ? (
//               <div className="bg-white border border-slate-200 rounded-xl">
//                 {[...Array(4)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
//               </div>
//             ) : (tab === 'pending' ? pending : bookings).length === 0 ? (
//               <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
//                 <span className="material-symbols-outlined text-slate-300 text-[48px]">inventory_2</span>
//                 <p className="text-slate-400 text-sm mt-2">{tab === 'pending' ? 'No pending bookings' : 'No bookings yet'}</p>
//               </div>
//             ) : (
//               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="bg-slate-50 border-b border-slate-200">
//                       {['Vessel','Requester','Route','Dates','Purpose','Status', isManager ? 'Actions' : ''].filter(Boolean).map(h => (
//                         <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(tab === 'pending' ? pending : bookings).map(b => <BookingRow key={b.id} b={b} />)}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </TabsContent>
//         ))}
//       </Tabs>

//       {/* Approve Modal */}
//       <Dialog open={!!approveId} onOpenChange={() => setApproveId('')}>
//         <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm rounded-xl shadow-xl">
//           <DialogHeader><DialogTitle className="text-slate-900 font-bold">Approve Booking</DialogTitle></DialogHeader>
//           <div className="space-y-3 mt-2">
//             <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Assign Captain</Label>
//             <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
//               <SelectTrigger className={sel}><SelectValue placeholder="Select captain" /></SelectTrigger>
//               <SelectContent className="bg-white border-slate-200 text-slate-800">
//                 {captains.map(c => <SelectItem key={c.id} value={c.id}>{c.fullName} — {c.licenseNumber}</SelectItem>)}
//               </SelectContent>
//             </Select>
//             <Button onClick={handleApprove} disabled={!selectedCaptain || submitting}
//               className="w-full bg-green-700 hover:bg-green-600 text-white rounded-lg h-10 font-bold">
//               {submitting ? 'Approving...' : 'Confirm Approval'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Reject Modal */}
//       <Dialog open={!!rejectId} onOpenChange={() => setRejectId('')}>
//         <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm rounded-xl shadow-xl">
//           <DialogHeader><DialogTitle className="text-slate-900 font-bold">Reject Booking</DialogTitle></DialogHeader>
//           <div className="space-y-3 mt-2">
//             <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Rejection Reason</Label>
//             <Input placeholder="Ship unavailable, scheduling conflict..." value={rejectReason}
//               onChange={e => setRejectReason(e.target.value)} className={inp} />
//             <Button onClick={handleReject} disabled={!rejectReason || submitting}
//               className="w-full bg-red-600 hover:bg-red-500 text-white rounded-lg h-10 font-bold">
//               {submitting ? 'Rejecting...' : 'Confirm Rejection'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </PageLayout>
//   );
// }









'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Booking {
  id: string; shipName: string; imoNumber: string; requesterName: string;
  departurePort: string; arrivalPort: string;
  plannedDeparture: string; plannedArrival: string;
  purpose: string; cargoWeightMT: number; cargoDescription: string;
  status: string; rejectionReason: string; approvedAt: string; createdAt: string;
}
interface Ship { id: string; name: string; imoNumber: string; status: string; }
interface Port { id: string; name: string; code: string; }
interface Captain { id: string; fullName: string; licenseNumber: string; isAvailable: boolean; }

const STATUS_BADGE: Record<string, string> = {
  Pending:   'bg-yellow-100 text-yellow-800',
  Approved:  'bg-blue-100 text-blue-800',
  Rejected:  'bg-red-100 text-red-800',
  UnderWay:  'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-slate-100 text-slate-600',
};

const initialFormState = {
  shipId: '', departurePortId: '', arrivalPortId: '',
  plannedDeparture: '', plannedArrival: '',
  purpose: '', cargoWeightMT: '', cargoDescription: '',
};

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-10 text-sm focus:ring-1 focus:ring-blue-500 focus-visible:ring-blue-500';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-10 text-sm w-full text-left focus:ring-1 focus:ring-blue-500';
// Dropdown panel styling jisse poori width aur achi spacing milegi
const selectContentStyle = "bg-white border border-slate-200 text-slate-800 shadow-lg rounded-xl max-h-60 w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] z-[100]";
const selectItemStyle = "py-2.5 px-3 text-sm focus:bg-slate-100 focus:text-slate-900 cursor-pointer rounded-md transition-colors";

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [approveId, setApproveId] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [selectedCaptain, setSelectedCaptain] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialFormState);

  const isManager = user?.role === 'Admin' || user?.role === 'FleetManager';
  const pending = bookings.filter(b => b.status === 'Pending');

  const fetchAll = useCallback(async () => {
    try {
      const [bRes, sRes, pRes] = await Promise.all([
        api.get('/Bookings'), 
        api.get('/Ships'), 
        api.get('/Ports')
      ]);
      setBookings(bRes.data || []);
      setShips((sRes.data || []).filter((s: Ship) => s.status === 'InPort' || s.status === 'Anchored'));
      setPorts(pRes.data || []);
      
      if (isManager) {
        const cRes = await api.get('/Captains');
        setCaptains((cRes.data || []).filter((c: Captain) => c.isAvailable));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally { 
      setLoading(false); 
    }
  }, [isManager]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (!user) { router.push('/login'); return; }
      fetchAll();
    }, 0);
    return () => clearTimeout(t);
  }, [user, router, fetchAll]);

  const handleOpenAddChange = (open: boolean) => {
    setShowAdd(open);
    if (!open) setForm(initialFormState);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/Bookings', { 
        ...form, 
        cargoWeightMT: form.cargoWeightMT ? parseFloat(form.cargoWeightMT) : null 
      });
      setSuccess('Booking submitted!'); 
      setShowAdd(false); 
      setForm(initialFormState);
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const handleApprove = async () => {
    if (!selectedCaptain) return;
    setSubmitting(true);
    try {
      await api.post(`/Bookings/${approveId}/approve`, { captainId: selectedCaptain });
      setSuccess('Booking approved!'); setApproveId(''); setSelectedCaptain(''); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await api.post(`/Bookings/${rejectId}/reject`, { rejectionReason: rejectReason });
      setSuccess('Booking rejected.'); setRejectId(''); setRejectReason(''); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const BookingRow = ({ b }: { b: Booking }) => (
    <tr className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-slate-900">{b.shipName}</p>
        <p className="text-[11px] font-mono text-slate-400">{b.imoNumber}</p>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{b.requesterName}</td>
      <td className="px-4 py-3">
        <p className="text-[12px] font-semibold text-slate-700">{b.departurePort}</p>
        <p className="text-[10px] text-slate-400">→ {b.arrivalPort}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-[11px] font-mono text-slate-600">{new Date(b.plannedDeparture).toLocaleDateString()}</p>
        <p className="text-[11px] font-mono text-slate-400">{new Date(b.plannedArrival).toLocaleDateString()}</p>
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-600 max-w-[150px] truncate">{b.purpose}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${STATUS_BADGE[b.status]}`}>
          {b.status}
        </span>
        {b.rejectionReason && <p className="text-[10px] text-red-500 mt-1">{b.rejectionReason}</p>}
      </td>
      {isManager && (
        <td className="px-4 py-3">
          {b.status === 'Pending' && (
            <div className="flex gap-2">
              <button onClick={() => setApproveId(b.id)}
                className="text-[10px] font-bold uppercase tracking-wider text-green-700 hover:text-green-900 transition-colors">
                Approve
              </button>
              <button onClick={() => setRejectId(b.id)}
                className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">
                Reject
              </button>
            </div>
          )}
        </td>
      )}
    </tr>
  );

  return (
    <PageLayout title="Bookings" subtitle={`${pending.length} pending approval`}
      pendingBookings={pending.length}
      actions={
        <Dialog open={showAdd} onOpenChange={handleOpenAddChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold text-lg">New Voyage Booking</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Provide vessel and scheduling details to request a new voyage.
              </DialogDescription>
            </DialogHeader>
            
            {/* Modal fields ke beech me custom gap-4 spacing apply ki hai */}
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Vessel</Label>
                <Select value={form.shipId} onValueChange={v => setForm(p => ({ ...p, shipId: v }))}>
                  <SelectTrigger className={sel}><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent className={selectContentStyle}>
                    {ships.map(s => (
                      <SelectItem key={s.id} value={s.id} className={selectItemStyle}>
                        {s.name} ({s.imoNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">From Port</Label>
                  <Select value={form.departurePortId} onValueChange={v => setForm(p => ({ ...p, departurePortId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select origin" /></SelectTrigger>
                    <SelectContent className={selectContentStyle}>
                      {ports.map(p => (
                        <SelectItem key={p.id} value={p.id} className={selectItemStyle}>
                          {p.code} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">To Port</Label>
                  <Select value={form.arrivalPortId} onValueChange={v => setForm(p => ({ ...p, arrivalPortId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select destination" /></SelectTrigger>
                    <SelectContent className={selectContentStyle}>
                      {ports.map(p => (
                        <SelectItem key={p.id} value={p.id} className={selectItemStyle}>
                          {p.code} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Departure</Label>
                  <Input type="datetime-local" value={form.plannedDeparture}
                    onChange={e => setForm(p => ({ ...p, plannedDeparture: e.target.value }))} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Arrival</Label>
                  <Input type="datetime-local" value={form.plannedArrival}
                    onChange={e => setForm(p => ({ ...p, plannedArrival: e.target.value }))} className={inp} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Purpose</Label>
                <Input placeholder="Cargo delivery, supply run..." value={form.purpose}
                  onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className={inp} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cargo (MT)</Label>
                  <Input type="number" placeholder="0" value={form.cargoWeightMT}
                    onChange={e => setForm(p => ({ ...p, cargoWeightMT: e.target.value }))} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cargo Type</Label>
                  <Input placeholder="Electronics, steel..." value={form.cargoDescription}
                    onChange={e => setForm(p => ({ ...p, cargoDescription: e.target.value }))} className={inp} />
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-11 font-bold mt-4 transition-all">
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>
      )}

      <Tabs defaultValue="pending" className="">
        <TabsList className="bg-white flex gap-2 border border-slate-200 p-1 rounded-lg">
          <TabsTrigger value="pending" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-slate-500 rounded-md text-[11px] font-bold tracking-wider uppercase">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-slate-500 rounded-md text-[11px] font-bold tracking-wider uppercase">
            All ({bookings.length})
          </TabsTrigger>
        </TabsList>

        {(['pending', 'all'] as const).map(tab => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl">
                {[...Array(4)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
              </div>
            ) : (tab === 'pending' ? pending : bookings).length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                <span className="material-symbols-outlined text-slate-300 text-[48px]">inventory_2</span>
                <p className="text-slate-400 text-sm mt-2">{tab === 'pending' ? 'No pending bookings' : 'No bookings yet'}</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Vessel','Requester','Route','Dates','Purpose','Status', isManager ? 'Actions' : ''].filter(Boolean).map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(tab === 'pending' ? pending : bookings).map(b => <BookingRow key={b.id} b={b} />)}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Approve Modal */}
      <Dialog open={!!approveId} onOpenChange={(open) => { if(!open) { setApproveId(''); setSelectedCaptain(''); } }}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm rounded-xl shadow-xl p-5">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Approve Booking</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">Assign an available captain to approve this voyage.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Assign Captain</Label>
            <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
              <SelectTrigger className={sel}><SelectValue placeholder="Select captain" /></SelectTrigger>
              <SelectContent className={selectContentStyle}>
                {captains.map(c => (
                  <SelectItem key={c.id} value={c.id} className={selectItemStyle}>
                    {c.fullName} — {c.licenseNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleApprove} disabled={!selectedCaptain || submitting}
              className="w-full bg-green-700 hover:bg-green-600 text-white rounded-lg h-10 font-bold mt-2">
              {submitting ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectId} onOpenChange={(open) => { if(!open) { setRejectId(''); setRejectReason(''); } }}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm rounded-xl shadow-xl p-5">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Reject Booking</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">Provide a reason for rejecting this request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Rejection Reason</Label>
            <Input placeholder="Ship unavailable, scheduling conflict..." value={rejectReason}
              onChange={e => setRejectReason(e.target.value)} className={inp} />
            <Button onClick={handleReject} disabled={!rejectReason || submitting}
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-lg h-10 font-bold mt-2">
              {submitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
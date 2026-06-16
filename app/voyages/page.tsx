'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Voyage {
  id: string; voyageNumber: string; shipName: string; imoNumber: string;
  captainName: string; departurePort: string; arrivalPort: string;
  departurePortCode: string; arrivalPortCode: string;
  plannedDeparture: string; plannedArrival: string;
  actualDeparture: string; actualArrival: string; status: string;
  distanceNauticalMiles: number; fuelConsumedMT: number;
  cargoWeightMT: number; cargoDescription: string;
}
interface Ship { id: string; name: string; imoNumber: string; }
interface Port { id: string; name: string; code: string; }
interface Captain { id: string; fullName: string; isAvailable: boolean; }

const STATUS_BADGE: Record<string, string> = {
  Planned:   'bg-blue-100 text-blue-800',
  UnderWay:  'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

export default function VoyagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    shipId: '', captainId: '', departurePortId: '', arrivalPortId: '',
    plannedDeparture: '', plannedArrival: '',
    cargoWeightMT: '', cargoDescription: '', distanceNauticalMiles: '', notes: '',
  });

  const isManager = user?.role === 'Admin' || user?.role === 'FleetManager';

  const fetchAll = useCallback(async () => {
    try {
      const [vRes, sRes, pRes, cRes] = await Promise.all([
        api.get('/voyages'), api.get('/ships'), api.get('/ports'), api.get('/captains'),
      ]);
      setVoyages(vRes.data); setShips(sRes.data);
      setPorts(pRes.data); setCaptains(cRes.data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (!user) { router.push('/login'); return; }
      fetchAll();
    }, 0);
    return () => clearTimeout(t);
  }, [user, router, fetchAll]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await api.post('/voyages', {
        ...form,
        captainId: form.captainId || null,
        cargoWeightMT: form.cargoWeightMT ? parseFloat(form.cargoWeightMT) : null,
        distanceNauticalMiles: form.distanceNauticalMiles ? parseFloat(form.distanceNauticalMiles) : null,
      });
      setSuccess('Voyage created!'); setShowAdd(false); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const handleDepart = async (id: string) => {
    try { await api.post(`/voyages/${id}/depart`); fetchAll(); } catch { }
  };
  const handleArrive = async (id: string) => {
    try { await api.post(`/voyages/${id}/arrive`, null); fetchAll(); } catch { }
  };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Voyages" subtitle={`${voyages.length} total voyages`}
      actions={isManager ? (
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + New Voyage
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
            <DialogHeader><DialogTitle className="text-slate-900 font-bold">Create Voyage</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Vessel</Label>
                  <Select value={form.shipId} onValueChange={v => setForm(p => ({ ...p, shipId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {ships.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Captain</Label>
                  <Select value={form.captainId} onValueChange={v => setForm(p => ({ ...p, captainId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {captains.map(c => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">From</Label>
                  <Select value={form.departurePortId} onValueChange={v => setForm(p => ({ ...p, departurePortId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {ports.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">To</Label>
                  <Select value={form.arrivalPortId} onValueChange={v => setForm(p => ({ ...p, arrivalPortId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {ports.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Distance (NM)</Label>
                  <Input type="number" placeholder="0" value={form.distanceNauticalMiles}
                    onChange={e => setForm(p => ({ ...p, distanceNauticalMiles: e.target.value }))} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cargo (MT)</Label>
                  <Input type="number" placeholder="0" value={form.cargoWeightMT}
                    onChange={e => setForm(p => ({ ...p, cargoWeightMT: e.target.value }))} className={inp} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cargo Description</Label>
                <Input placeholder="Steel, electronics..." value={form.cargoDescription}
                  onChange={e => setForm(p => ({ ...p, cargoDescription: e.target.value }))} className={inp} />
              </div>
              <Button onClick={handleCreate} disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold">
                {submitting ? 'Creating...' : 'Create Voyage'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : undefined}
    >
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
        </div>
      ) : voyages.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">route</span>
          <p className="text-slate-400 text-sm mt-2">No voyages yet</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Voyage No.','Vessel','Route','Captain','Planned Dates','Distance','Cargo','Status', isManager ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {voyages.map((v, i) => (
                <tr key={v.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3 font-mono text-[12px] text-blue-700 font-bold">{v.voyageNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{v.shipName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{v.imoNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      {v.departurePortCode}
                      <span className="text-slate-400 text-xs">→</span>
                      {v.arrivalPortCode}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{v.captainName || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-mono text-slate-600">{new Date(v.plannedDeparture).toLocaleDateString()}</p>
                    <p className="text-[11px] font-mono text-slate-400">{new Date(v.plannedArrival).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">
                    {v.distanceNauticalMiles ? `${v.distanceNauticalMiles} nm` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">
                    {v.cargoWeightMT ? `${v.cargoWeightMT} MT` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${STATUS_BADGE[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {v.status === 'Planned' && (
                          <button onClick={() => handleDepart(v.id)}
                            className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors">
                            Depart
                          </button>
                        )}
                        {v.status === 'UnderWay' && (
                          <button onClick={() => handleArrive(v.id)}
                            className="text-[10px] font-bold uppercase tracking-wider text-green-700 hover:text-green-900 transition-colors">
                            Arrive
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}




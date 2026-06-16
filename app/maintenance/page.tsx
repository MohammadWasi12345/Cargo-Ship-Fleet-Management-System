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

interface MaintenanceRecord {
  id: string; shipName: string; imoNumber: string; type: string;
  serviceDate: string; cost: number; description: string;
  serviceProvider: string; portOfMaintenance: string;
  nauticalMilesAtService: number; nextServiceDate: string;
  isCompleted: boolean; loggedBy: string;
}
interface Ship { id: string; name: string; imoNumber: string; }

const TYPE_BADGE: Record<string, string> = {
  Scheduled:   'bg-blue-100 text-blue-800',
  Repair:      'bg-red-100 text-red-800',
  Inspection:  'bg-green-100 text-green-800',
  Emergency:   'bg-orange-100 text-orange-800',
  Drydock:     'bg-purple-100 text-purple-800',
};

const MAINT_TYPES = [
  { label: 'Scheduled', value: '0' }, { label: 'Repair', value: '1' },
  { label: 'Inspection', value: '2' }, { label: 'Emergency', value: '3' },
  { label: 'Drydock', value: '4' },
];

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

export default function MaintenancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    shipId: '', type: '0', serviceDate: '', cost: '',
    description: '', serviceProvider: '', portOfMaintenance: '',
    nauticalMilesAtService: '', nextServiceDate: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      const [mRes, sRes] = await Promise.all([api.get('/maintenance'), api.get('/ships')]);
      setRecords(mRes.data); setShips(sRes.data);
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

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await api.post('/maintenance', {
        ...form,
        type: parseInt(form.type),
        cost: parseFloat(form.cost) || 0,
        nauticalMilesAtService: form.nauticalMilesAtService ? parseFloat(form.nauticalMilesAtService) : null,
        nextServiceDate: form.nextServiceDate || null,
      });
      setSuccess('Maintenance record added!'); setShowAdd(false); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const totalCost = records.reduce((s, r) => s + r.cost, 0);
  const emergency = records.filter(r => r.type === 'Emergency').length;

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Maintenance" subtitle={`${records.length} service records`}
      actions={
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
            <DialogHeader><DialogTitle className="text-slate-900 font-bold">Add Maintenance Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Vessel</Label>
                <Select value={form.shipId} onValueChange={v => setForm(p => ({ ...p, shipId: v }))}>
                  <SelectTrigger className={sel}><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {ships.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.imoNumber})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className={sel}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {MAINT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Service Date</Label>
                <Input type="datetime-local" value={form.serviceDate}
                  onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))} className={inp} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Cost ($)</Label>
                <Input type="number" placeholder="0" value={form.cost}
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} className={inp} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Odometer (NM)</Label>
                <Input type="number" placeholder="0" value={form.nauticalMilesAtService}
                  onChange={e => setForm(p => ({ ...p, nauticalMilesAtService: e.target.value }))} className={inp} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Service Provider</Label>
                <Input placeholder="Workshop name" value={form.serviceProvider}
                  onChange={e => setForm(p => ({ ...p, serviceProvider: e.target.value }))} className={inp} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Port</Label>
                <Input placeholder="Rotterdam" value={form.portOfMaintenance}
                  onChange={e => setForm(p => ({ ...p, portOfMaintenance: e.target.value }))} className={inp} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Description</Label>
                <Input placeholder="Oil change, engine inspection..." value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inp} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Next Service Date</Label>
                <Input type="date" value={form.nextServiceDate}
                  onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))} className={inp} />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold mt-4">
              {submitting ? 'Saving...' : 'Save Record'}
            </Button>
          </DialogContent>
        </Dialog>
      }
    >
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Records', value: records.length, icon: '🛠️' },
          { label: 'Total Cost', value: `$${totalCost.toFixed(0)}`, icon: '💳' },
          { label: 'Emergency', value: emergency, icon: '🚨' },
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

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">build</span>
          <p className="text-slate-400 text-sm mt-2">No maintenance records</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Vessel','Type','Date','Description','Cost','Provider','Port','Next Service'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r, i) => (
                <tr key={r.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{r.shipName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{r.imoNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${TYPE_BADGE[r.type] || 'bg-slate-100 text-slate-600'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{new Date(r.serviceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-700 max-w-[180px] truncate">{r.description}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-red-600 font-bold">${r.cost.toFixed(0)}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{r.serviceProvider || '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{r.portOfMaintenance || '—'}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">
                    {r.nextServiceDate ? new Date(r.nextServiceDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
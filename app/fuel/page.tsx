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

interface FuelLog {
  id: string; shipName: string; imoNumber: string; date: string;
  quantityMT: number; costPerMT: number; totalCost: number;
  nauticalMilesAtBunkering: number; fuelType: string;
  portOfBunkering: string; supplier: string; loggedBy: string;
}
interface Ship { id: string; name: string; imoNumber: string; }

const FUEL_TYPES = [
  { label: 'HFO', value: '0' }, { label: 'MGO', value: '1' },
  { label: 'VLSFO', value: '2' }, { label: 'LNG', value: '3' }, { label: 'MDO', value: '4' },
];

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

export default function FuelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    shipId: '', date: '', quantityMT: '', costPerMT: '',
    nauticalMilesAtBunkering: '', fuelType: '0',
    portOfBunkering: '', supplier: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      const [lRes, sRes] = await Promise.all([api.get('/fuellogs'), api.get('/ships')]);
      setLogs(lRes.data); setShips(sRes.data);
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
      await api.post('/fuellogs', {
        ...form,
        quantityMT: parseFloat(form.quantityMT) || 0,
        costPerMT: parseFloat(form.costPerMT) || 0,
        nauticalMilesAtBunkering: parseFloat(form.nauticalMilesAtBunkering) || 0,
        fuelType: parseInt(form.fuelType),
      });
      setSuccess('Fuel log added!'); setShowAdd(false); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const totalCost = logs.reduce((s, l) => s + l.totalCost, 0);
  const totalMT = logs.reduce((s, l) => s + l.quantityMT, 0);

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Fuel Logs" subtitle={`${logs.length} bunkering records`}
      actions={
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + Add Fuel Log
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
            <DialogHeader><DialogTitle className="text-slate-900 font-bold">Add Fuel Log</DialogTitle></DialogHeader>
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
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Date</Label>
                <Input type="datetime-local" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inp} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Fuel Type</Label>
                <Select value={form.fuelType} onValueChange={v => setForm(p => ({ ...p, fuelType: v }))}>
                  <SelectTrigger className={sel}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {FUEL_TYPES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {[
                { label: 'Quantity (MT)', key: 'quantityMT', placeholder: '500' },
                { label: 'Cost per MT ($)', key: 'costPerMT', placeholder: '650' },
                { label: 'Odometer (NM)', key: 'nauticalMilesAtBunkering', placeholder: '12000' },
                { label: 'Port of Bunkering', key: 'portOfBunkering', placeholder: 'Singapore' },
                { label: 'Supplier', key: 'supplier', placeholder: 'Shell Marine' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">{f.label}</Label>
                  <Input type={['quantityMT','costPerMT','nauticalMilesAtBunkering'].includes(f.key) ? 'number' : 'text'}
                    placeholder={f.placeholder}
                    value={String(form[f.key as keyof typeof form])}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inp} />
                </div>
              ))}
            </div>
            <Button onClick={handleAdd} disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold mt-4">
              {submitting ? 'Saving...' : 'Save Fuel Log'}
            </Button>
          </DialogContent>
        </Dialog>
      }
    >
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Records', value: logs.length, icon: '⚡' },
          { label: 'Total Quantity', value: `${totalMT.toFixed(0)}MT `, icon: '⛽' },
          { label: 'Total Cost', value: `$${totalCost.toFixed(0)}`, icon: '💰' },
        ].map((s, i) => (
           <div key={i} className="bg-white border border-slate-200 rounded-md shadow-xl p-5  items-center gap-4 shadow-sm min-w-0">
            <div className="w-10 h-20 rounded-lg bg-blue-50 flex items-center justify-center ">
              <span className=" text-blue-600 text-xl">{s.icon}</span>
            
            <div className="flex flex-col min-w-0">
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
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">ev_station</span>
          <p className="text-slate-400 text-sm mt-2">No fuel logs yet</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Vessel','Date','Fuel Type','Quantity (MT)','Cost/MT','Total Cost','Odometer','Port','Supplier'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l, i) => (
                <tr key={l.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{l.shipName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{l.imoNumber}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{new Date(l.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">{l.fuelType}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-700 font-semibold">{l.quantityMT} MT</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">${l.costPerMT}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-blue-700 font-bold">${l.totalCost.toFixed(0)}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{l.nauticalMilesAtBunkering} nm</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{l.portOfBunkering || '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{l.supplier || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
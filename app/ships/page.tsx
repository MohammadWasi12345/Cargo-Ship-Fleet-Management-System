
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

interface Ship {
  id: string; imoNumber: string; name: string; flag: string;
  type: string; status: string; yearBuilt: number;
  grossTonnage: number; deadweightTonnage: number;
  lengthOverall: number; maxSpeedKnots: number;
  fuelCapacityMT: number; primaryFuelType: string;
  nauticalMilesTravelled: number;
  currentLatitude: number; currentLongitude: number; notes: string;
}

const STATUS_BADGE: Record<string, string> = {
  UnderWay:         'bg-blue-100 text-blue-800',
  InPort:           'bg-green-100 text-green-800',
  Anchored:         'bg-amber-100 text-amber-800',
  UnderMaintenance: 'bg-red-100 text-red-800',
  OutOfService:     'bg-slate-100 text-slate-600',
};

const STATUS_DOT: Record<string, string> = {
  UnderWay: 'bg-blue-600', InPort: 'bg-green-600',
  Anchored: 'bg-amber-500', UnderMaintenance: 'bg-red-600',
};

const SHIP_TYPES = [
  { label: 'Container Ship', value: '0' },
  { label: 'Bulk Carrier',   value: '1' },
  { label: 'Tanker',         value: '2' },
  { label: 'Cargo Vessel',   value: '3' },
  { label: 'RoRo',           value: '4' },
  { label: 'General Cargo',  value: '5' },
];

const FUEL_TYPES = [
  { label: 'HFO',   value: '0' },
  { label: 'MGO',   value: '1' },
  { label: 'VLSFO', value: '2' },
  { label: 'LNG',   value: '3' },
  { label: 'MDO',   value: '4' },
];

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm focus:border-blue-400';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

export default function ShipsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    imoNumber: '', name: '', flag: '', type: 0,
    yearBuilt: 2020, grossTonnage: 0, deadweightTonnage: 0,
    lengthOverall: 0, beam: 0, draft: 0, maxSpeedKnots: 0,
    fuelCapacityMT: 0, primaryFuelType: 0, notes: '',
  });

  const isManager = user?.role === 'Admin' || user?.role === 'FleetManager';

  const fetchShips = useCallback(async () => {
    try { const res = await api.get('/ships'); setShips(res.data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (!user) { router.push('/login'); return; }
      fetchShips();
    }, 0);
    return () => clearTimeout(t);
  }, [user, router, fetchShips]);

  const handleAdd = async () => {
    setSubmitting(true); setError('');
    try {
      await api.post('/ships', form);
      setSuccess('Ship registered!');
      setShowAdd(false);
      fetchShips();
      setForm({ imoNumber: '', name: '', flag: '', type: 0, yearBuilt: 2020, grossTonnage: 0, deadweightTonnage: 0, lengthOverall: 0, beam: 0, draft: 0, maxSpeedKnots: 0, fuelCapacityMT: 0, primaryFuelType: 0, notes: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response: { data: { message: string } } };
        setError(err.response?.data?.message || 'Failed to add ship.');
      } else setError('Failed to add ship.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ship?')) return;
    try { await api.delete(`/ships/${id}`); fetchShips(); } catch { }
  };

  const filtered = ships.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.imoNumber.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'all' || s.status === filterStatus)
  );

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Fleet Management" subtitle={`${ships.length} vessels registered`}
      actions={isManager ? (
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + Register Vessel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold">Register New Vessel</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'IMO Number', key: 'imoNumber', placeholder: 'IMO1234567' },
                { label: 'Vessel Name', key: 'name', placeholder: 'MV Pacific Star' },
                { label: 'Flag State', key: 'flag', placeholder: 'Panama' },
                { label: 'Year Built', key: 'yearBuilt', placeholder: '2020', type: 'number' },
                { label: 'Gross Tonnage', key: 'grossTonnage', placeholder: '50000', type: 'number' },
                { label: 'Deadweight (MT)', key: 'deadweightTonnage', placeholder: '75000', type: 'number' },
                { label: 'Length (m)', key: 'lengthOverall', placeholder: '250', type: 'number' },
                { label: 'Beam (m)', key: 'beam', placeholder: '40', type: 'number' },
                { label: 'Draft (m)', key: 'draft', placeholder: '12', type: 'number' },
                { label: 'Max Speed (kts)', key: 'maxSpeedKnots', placeholder: '20', type: 'number' },
                { label: 'Fuel Capacity (MT)', key: 'fuelCapacityMT', placeholder: '2000', type: 'number' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">{f.label}</Label>
                  <Input type={f.type || 'text'} placeholder={f.placeholder}
                    value={String(form[f.key as keyof typeof form])}
                    onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                    className={inp} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Ship Type</Label>
                <Select value={String(form.type)} onValueChange={v => setForm(p => ({ ...p, type: parseInt(v) }))}>
                  <SelectTrigger className={sel}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {SHIP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Primary Fuel</Label>
                <Select value={String(form.primaryFuelType)} onValueChange={v => setForm(p => ({ ...p, primaryFuelType: parseInt(v) }))}>
                  <SelectTrigger className={sel}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {FUEL_TYPES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Notes</Label>
                <Input placeholder="Optional notes..." value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inp} />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAdd} disabled={submitting}
                className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold">
                {submitting ? 'Registering...' : 'Register Vessel'}
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-10">
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : undefined}
    >
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"></span>
          <Input placeholder="Search Ship" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm" />
        </div>
        <div className="flex gap-3 flex-wrap">
          {['all','UnderWay','InPort','Anchored','UnderMaintenance'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase border transition-all ${
                filterStatus === s
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300 hover:text-slate-700'
              }`}>
              {s === 'all' ? 'All Ships' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">directions_boat</span>
          <p className="text-slate-400 text-sm mt-2 font-medium">No ships found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className=''>
          <table className="w-full text-left border-separate border-spacing-y-3 ">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Vessel Name','IMO','Type','Flag','Built','GRT','Speed','Fuel','Status','Miles', isManager ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ship, i) => (
                <tr key={ship.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{ship.name}</p>
                    {ship.currentLatitude && (
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        📍 {ship.currentLatitude?.toFixed(2)}°, {ship.currentLongitude?.toFixed(2)}°
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{ship.imoNumber}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{ship.type}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{ship.flag}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{ship.yearBuilt}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{(ship.grossTonnage/1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{ship.maxSpeedKnots} kts</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{ship.primaryFuelType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${STATUS_BADGE[ship.status] || 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[ship.status] || 'bg-slate-400'}`} />
                      {ship.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{(ship.nauticalMilesTravelled/1000).toFixed(0)}k nm</td>
                  {isManager && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => router.push('/tracking')}
                          className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors">
                          Track
                        </button>
                        <button onClick={() => handleDelete(ship.id)}
                          className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
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
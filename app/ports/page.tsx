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

interface Port {
  id: string; name: string; code: string; country: string;
  city: string; latitude: number; longitude: number; timeZone: string; notes: string;
}

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';

export default function PortsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', code: '', country: '', city: '',
    latitude: '', longitude: '', timeZone: '', notes: '',
  });

  const isManager = user?.role === 'Admin' || user?.role === 'FleetManager';

  const fetchPorts = useCallback(async () => {
    try { const res = await api.get('/ports'); setPorts(res.data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (!user) { router.push('/login'); return; }
      fetchPorts();
    }, 0);
    return () => clearTimeout(t);
  }, [user, router, fetchPorts]);

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await api.post('/ports', { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
      setSuccess('Port added!'); setShowAdd(false); fetchPorts();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const filtered = ports.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Ports" subtitle={`${ports.length} ports worldwide`}
      actions={isManager ? (
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + Add Port
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
            <DialogHeader><DialogTitle className="text-slate-900 font-bold">Add New Port</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'Port Name', key: 'name', placeholder: 'Port of Shanghai', col: 2 },
                { label: 'LOCODE', key: 'code', placeholder: 'CNSHA' },
                { label: 'Country', key: 'country', placeholder: 'China' },
                { label: 'City', key: 'city', placeholder: 'Shanghai' },
                { label: 'Latitude', key: 'latitude', placeholder: '31.2304' },
                { label: 'Longitude', key: 'longitude', placeholder: '121.4737' },
                { label: 'Timezone', key: 'timeZone', placeholder: 'Asia/Shanghai' },
                { label: 'Notes', key: 'notes', placeholder: 'Optional' },
              ].map(f => (
                <div key={f.key} className={`space-y-1.5 ${f.col === 2 ? 'col-span-2' : ''}`}>
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">{f.label}</Label>
                  <Input placeholder={f.placeholder}
                    value={String(form[f.key as keyof typeof form])}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inp} />
                </div>
              ))}
            </div>
            <Button onClick={handleAdd} disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold mt-4">
              {submitting ? 'Adding...' : 'Add Port'}
            </Button>
          </DialogContent>
        </Dialog>
      ) : undefined}
    >
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>}

      <div className=" relative  max-w-xs mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"></span>
  
         <Input placeholder=" Search Port" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm" />
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">anchor</span>
          <p className="text-slate-400 text-sm mt-2">No ports found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Port Name','LOCODE','Country','City','Latitude','Longitude','Timezone'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p, i) => (
                <tr key={p.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] font-bold text-blue-700">{p.code}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{p.country}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{p.city}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{p.latitude}°</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{p.longitude}°</td>
                  <td className="px-4 py-3 text-[12px] text-slate-500">{p.timeZone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
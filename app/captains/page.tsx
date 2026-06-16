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

interface Captain {
  id: string; userId: string; fullName: string; email: string;
  licenseNumber: string; licenseClass: string; licenseExpiry: string;
  yearsExperience: number; isAvailable: boolean; nationality: string;
}
interface User { id: string; fullName: string; email: string; role: string; }
interface Ship { id: string; name: string; imoNumber: string; }

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

export default function CaptainsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    userId: '', licenseNumber: '', licenseClass: 'Class I',
    licenseExpiry: '', yearsExperience: 0, nationality: '',
  });
  const [assignForm, setAssignForm] = useState({ captainId: '', shipId: '', startDate: '' });

  const fetchAll = useCallback(async () => {
    try {
      const [cRes, uRes, sRes] = await Promise.all([api.get('/captains'), api.get('/users'), api.get('/ships')]);
      setCaptains(cRes.data);
      setUsers(uRes.data.filter((u: User) => u.role === 'Employee' || u.role === 'Captain'));
      setShips(sRes.data);
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
      await api.post('/captains', form);
      setSuccess('Captain registered!'); setShowAdd(false); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const handleAssign = async () => {
    setSubmitting(true);
    try {
      await api.post('/captains/assign', assignForm);
      setSuccess('Captain assigned!'); setShowAssign(false); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Captains" subtitle={`${captains.length} registered captains`}
      actions={
        <div className="flex gap-2">
          <Dialog open={showAssign} onOpenChange={setShowAssign}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
                Assign to Ship
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm rounded-xl shadow-xl">
              <DialogHeader><DialogTitle className="text-slate-900 font-bold">Assign Captain to Ship</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Captain</Label>
                  <Select value={assignForm.captainId} onValueChange={v => setAssignForm(p => ({ ...p, captainId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select captain" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {captains.filter(c => c.isAvailable).map(c => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Ship</Label>
                  <Select value={assignForm.shipId} onValueChange={v => setAssignForm(p => ({ ...p, shipId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select ship" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {ships.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.imoNumber})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Start Date</Label>
                  <Input type="date" value={assignForm.startDate}
                    onChange={e => setAssignForm(p => ({ ...p, startDate: e.target.value }))} className={inp} />
                </div>
                <Button onClick={handleAssign} disabled={submitting}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold">
                  {submitting ? 'Assigning...' : 'Assign Captain'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
                + Register Captain
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
              <DialogHeader><DialogTitle className="text-slate-900 font-bold">Register New Captain</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Select User</Label>
                  <Select value={form.userId} onValueChange={v => setForm(p => ({ ...p, userId: v }))}>
                    <SelectTrigger className={sel}><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {users.map(u => <SelectItem key={u.id} value={u.id}>{u.fullName} — {u.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {[
                  { label: 'License Number', key: 'licenseNumber', placeholder: 'LIC-123456' },
                  { label: 'Nationality', key: 'nationality', placeholder: 'Pakistani' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">{f.label}</Label>
                    <Input placeholder={f.placeholder} value={String(form[f.key as keyof typeof form])}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inp} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">License Class</Label>
                  <Select value={form.licenseClass} onValueChange={v => setForm(p => ({ ...p, licenseClass: v }))}>
                    <SelectTrigger className={sel}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {['Class I','Class II','Class III','Master Mariner'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Years Experience</Label>
                  <Input type="number" placeholder="0" value={form.yearsExperience}
                    onChange={e => setForm(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))} className={inp} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">License Expiry</Label>
                  <Input type="date" value={form.licenseExpiry}
                    onChange={e => setForm(p => ({ ...p, licenseExpiry: e.target.value }))} className={inp} />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold mt-4">
                {submitting ? 'Registering...' : 'Register Captain'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
        </div>
      ) : captains.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">person_4</span>
          <p className="text-slate-400 text-sm mt-2">No captains registered</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Name','Email','License No.','Class','Expiry','Experience','Nationality','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {captains.map((c, i) => (
                <tr key={c.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">{c.fullName}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{c.licenseNumber}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{c.licenseClass}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">
                    {new Date(c.licenseExpiry).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{c.yearsExperience} yrs</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{c.nationality || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      c.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                      {c.isAvailable ? 'Available' : 'On Duty'}
                    </span>
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



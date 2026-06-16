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

interface User {
  id: string; fullName: string; email: string; role: string;
  department: string; phoneNumber: string; isActive: boolean;
  isApproved: boolean; createdAt: string;
}

const ROLE_BADGE: Record<string, string> = {
  Admin:        'bg-purple-100 text-purple-800',
  FleetManager: 'bg-blue-100 text-blue-800',
  Captain:      'bg-teal-100 text-teal-800',
  Employee:     'bg-slate-100 text-slate-700',
  Customer:     'bg-orange-100 text-orange-800',
};

const inp = 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg h-9 text-sm';
const sel = 'bg-slate-50 border-slate-200 text-slate-800 rounded-lg h-9';

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    role: '3', department: '', phoneNumber: '',
  });

  const ROLES = [
    { label: 'Employee', value: '3' }, { label: 'Customer', value: '4' },
    { label: 'Captain', value: '2' }, { label: 'Fleet Manager', value: '1' },
    { label: 'Admin', value: '0' },
  ];

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, pRes] = await Promise.all([api.get('/users'), api.get('/users/pending-approval')]);
      setUsers(uRes.data); setPending(pRes.data);
    } catch { } finally { setLoading(false); }
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

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await api.post('/users', { ...form, role: parseInt(form.role) });
      setSuccess('User created!'); setShowAdd(false); fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSubmitting(false); }
  };

  const handleToggle = async (id: string) => {
    try { await api.patch(`/users/${id}/toggle-active`); fetchAll(); } catch { }
  };

  const handleApprove = async (id: string) => {
    try { await api.post(`/users/${id}/approve`); fetchAll(); } catch { }
  };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PageLayout title="Users" subtitle={`${users.length} system users`}
      actions={
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase px-4 h-9">
              + Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg rounded-xl shadow-xl">
            <DialogHeader><DialogTitle className="text-slate-900 font-bold">Create User</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'Full Name', key: 'fullName', placeholder: 'John Smith', col: 2 },
                { label: 'Email', key: 'email', placeholder: 'john@company.com' },
                { label: 'Password', key: 'password', placeholder: '••••••••', type: 'password' },
                { label: 'Department', key: 'department', placeholder: 'Operations' },
                { label: 'Phone', key: 'phoneNumber', placeholder: '+1 234 567' },
              ].map(f => (
                <div key={f.key} className={`space-y-1.5 ${f.col === 2 ? 'col-span-2' : ''}`}>
                  <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">{f.label}</Label>
                  <Input type={f.type || 'text'} placeholder={f.placeholder}
                    value={String(form[f.key as keyof typeof form])}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inp} />
                </div>
              ))}
              <div className="col-span-2 space-y-1.5">
                <Label className="text-slate-600 text-[11px] font-bold tracking-wider uppercase">Role</Label>
                <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className={sel}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg h-10 font-bold mt-4">
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogContent>
        </Dialog>
      }
    >
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✅ {success}</div>}

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-yellow-200 bg-yellow-100/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600 text-[18px]">pending</span>
            <span className="text-[11px] font-bold tracking-widest text-yellow-800 uppercase">
              Pending Approval ({pending.length})
            </span>
          </div>
          <div className="divide-y divide-yellow-100">
            {pending.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                  <p className="text-[12px] text-slate-500">{u.email} • {u.role}</p>
                </div>
                <button onClick={() => handleApprove(u.id)}
                  className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase hover:bg-green-600 transition-colors">
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Name','Email','Role','Department','Phone','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, i) => (
                <tr key={u.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{u.department || '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600">{u.phoneNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-600' : 'bg-red-600'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== user.userId && (
                      <button onClick={() => handleToggle(u.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${u.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-700 hover:text-green-900'}`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
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
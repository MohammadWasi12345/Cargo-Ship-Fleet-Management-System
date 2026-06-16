
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// ── Types ──────────────────────────────────────────
interface Stats {
    totalShips: number;
    shipsUnderWay: number;
    shipsInPort: number;
    shipsAnchored: number;
    shipsUnderMaintenance: number;
    totalCaptains: number;
    availableCaptains: number;
    totalPorts: number;
    pendingBookings: number;
    activeVoyages: number;
    totalVoyagesThisMonth: number;
    totalFuelCostThisMonth: number;
    totalMaintenanceCostThisMonth: number;
    totalCostThisMonth: number;
    totalFuelQuantityThisMonth: number;
    topCostShips: {
        shipName: string;
        imoNumber: string;
        fuelCost: number;
        maintenanceCost: number;
        totalCost: number;
    }[];
    monthlyStats: {
        month: string;
        fuelCost: number;
        maintenanceCost: number;
        totalVoyages: number;
        fuelQuantityMT: number;
    }[];
    shipPositions: {
        shipId: string;
        shipName: string;
        imoNumber: string;
        status: string;
        type: string;
        latitude: number;
        longitude: number;
    }[];
}

const NAV = [
    { icon: '▣', label: 'Overview', path: '/dashboard', roles: ['Admin', 'FleetManager', 'Captain', 'Employee', 'Customer'] },
    { icon: '🚢', label: 'Fleet', path: '/ships', roles: ['Admin', 'FleetManager', 'Captain', 'Employee', 'Customer'] },
    { icon: '🗺️', label: 'Live Tracking', path: '/tracking', roles: ['Admin', 'FleetManager', 'Captain'] },
    { icon: '⚓', label: 'Voyages', path: '/voyages', roles: ['Admin', 'FleetManager', 'Captain'] },
    { icon: '📋', label: 'Bookings', path: '/bookings', roles: ['Admin', 'FleetManager', 'Employee', 'Customer'] },
    { icon: '👨‍✈️', label: 'Captains', path: '/captains', roles: ['Admin', 'FleetManager'] },
    { icon: '⛽', label: 'Fuel Logs', path: '/fuel', roles: ['Admin', 'FleetManager', 'Captain'] },
    { icon: '🔧', label: 'Maintenance', path: '/maintenance', roles: ['Admin', 'FleetManager'] },
    { icon: '🏗️', label: 'Ports', path: '/ports', roles: ['Admin', 'FleetManager'] },
    { icon: '👥', label: 'Users', path: '/users', roles: ['Admin'] },
    { icon: '🔐', label: 'Audit Logs', path: '/audit', roles: ['Admin'] },
];

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];


function StatCard({
    label, value, sub, icon, accent, trend,
}: {
    label: string; value: string | number; sub: string;
    icon: string; accent: string; trend?: string;
}) {
    return (
        <div className={`
      relative overflow-hidden rounded-2xl min-h-[140px] flex flex-col justify-center items-cenetr text-center
      bg-slate-300 border border-slate-200
      hover:border-cyan-200 transition-all duration-200 group shadow-lg gap-1
      px-6 py-6
    `}>
            {/* Glow effect background */}
            <div className={`absolute top-0 right-0 w-24 h-24 blur-2xl opacity-50 ${accent}`} />

            {/* Top Row: Icon and Trend */}
            <div className="relative flex gap-x-2 gap-y-2 items-center justify-center text-center mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${accent} bg-opacity-10 border border-opacity-20`}
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-0.5 rounded-full">
                        {trend}
                    </span>
                )}
            </div>

            {/* Bottom Row: Text content */}
            <div className='px-2 py-2'>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1.5">{value}</p>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-slate-500 text-xs mt-1  truncate">{sub}</p>
            </div>
        </div>
    );
}


                   
function Sidebar({
  pendingBookings,
  onNavigate,
}: {
  pendingBookings?: number;
  onNavigate: (p: string) => void;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user) return null;
  const filtered = NAV.filter(n => n.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/80 backdrop-blur-xl border-r border-slate-200">

      {/* ── Logo ── */}
      <div className="h-16 px-4 flex items-center flex-shrink-0 border-b border-slate-200">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500
            flex items-center justify-center text-base shadow-lg shadow-blue-500/25 flex-shrink-0">
            ⚓
          </div>
          <div className="text-left">
            <p className="text-slate-900 font-bold text-sm leading-none">ShipFleet</p>
            <p className="text-blue-400/60 text-[10px] mt-0.5">Maritime OS</p>
          </div>
        </button>
      </div>

      {/* ── Nav ── */}
      <ScrollArea className="flex-1  py-2 px-2">
        <div className="space-y-0.5 flex flex-col gap-3">


          {filtered.map(item => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-150 border
                  ${active
                    ? 'bg-blue-600/15 text-blue-400 border-blue-500/20 shadow-sm'
                    : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                  }
                `}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.label === 'Bookings' && (pendingBookings ?? 0) > 0 && (
                  <span className="bg-red-500 text-slate-900 text-[10px] font-bold
                    px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
                    {pendingBookings}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* ── User footer ── */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl
          hover:bg-slate-800/40 transition-colors group cursor-pointer">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500
              text-slate-900 text-sm font-bold">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate leading-none">
              {user.fullName}
            </p>
            <p className="text-slate-500 text-xs mt-0.5 truncate">{user.role}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-slate-600 hover:text-red-400 transition-colors
              opacity-0 group-hover:opacity-100 p-1 flex-shrink-0 text-base"
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const currentPath = usePathname();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [activeChart, setActiveChart] = useState<'costs' | 'voyages'>('costs');
    const [mounted, setMounted] = useState(false);

    const isManager = user?.role === 'Admin' || user?.role === 'FleetManager';

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
    const t = setTimeout(() => {
        setMounted(true);
        if (!user) { router.push('/login'); return; }
        if (isManager) fetchStats();
    }, 0);
    return () => clearTimeout(t);
}, [user, router, fetchStats, isManager]);



    const handleNavigate = (path: string) => router.push(path);


    if (!mounted || !user) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
);

    const pieData = stats ? [
        { name: 'Underway', value: stats.shipsUnderWay },
        { name: 'In Port', value: stats.shipsInPort },
        { name: 'Anchored', value: stats.shipsAnchored },
        { name: 'Maintenance', value: stats.shipsUnderMaintenance },
    ].filter(d => d.value > 0) : [];

    const sidebarProps = {
        user: { fullName: user.fullName, role: user.role, email: user.email },
        stats,
        currentPath,
        onNavigate: handleNavigate,
        onLogout: logout,
    };

    return (
        <div className="flex lg:gap-3 h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 overflow-hidden font-sans">

            <aside className="hidden lg:flex w-[220px] xl:w-[240px] flex-shrink-0">
                <Sidebar {...sidebarProps} />
            </aside>

            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost" size="sm"
                        className="lg:hidden fixed top-5 left-4 z-50 text-slate-600 hover:text-slate-900 bg-slate-300 border border-slate-800 rounded-xl p-2 h-9 w-9 shadow"
                    >
                        ☰
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[240px] border-slate-800">
                    <Sidebar {...sidebarProps} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex flex-col min-w-0 gap-8 overflow-hidden">

                {/* 🌟 FIXED HEADER CENTER ALIGNMENT: Synchronized container inside header */}
                <header className="flex-shrink-0 h-16 bg-slate-300/80 backdrop-blur-xl/95 backdrop-blur-md
          border-b border-slate-200 sticky top-4 z-40">
                    <div className="w-full  mx-auto px-6 md:px-10 flex items-center justify-between">
                        <div className="flex items-center gap-4 lg:gap-0">
                            <div className="w-10 lg:hidden" />
                            <div>
                                <h1 className="text-slate-900 font-bold text-lg tracking-tight leading-none">Overview</h1>
                                <p className="text-slate-500 text-xs mt-1.5 hidden sm:block font-medium">
                                    Fleet intelligence dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10
                border border-emerald-500/20 rounded-full px-3.5 py-1.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Live</span>
                            </div>

                            <Button
                                variant="ghost" size="sm"
                                onClick={fetchStats}
                                className="text-slate-600 hover:text-slate-900 hover:bg-slate-800 rounded-xl h-9 w-9 p-0 border border-slate-800/40"
                            >
                                🔄
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5
                    rounded-xl border border-slate-800 bg-slate-300
                    hover:border-cyan-200 transition-colors shadow-sm">
                                        <Avatar className="w-6 h-6">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-slate-900 text-xs font-bold">
                                                {user.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-slate-700 text-sm font-medium hidden md:block">
                                            {user.fullName.split(' ')[0]}
                                        </span>
                                        <span className="text-slate-600 text-xs hidden md:block">▾</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end"
                                    className="bg-slate-300 border-slate-800 text-slate-900 w-48 rounded-xl p-1.5 shadow-xl">
                                    <DropdownMenuLabel className="text-slate-600 text-xs px-2 py-1.5 font-semibold uppercase tracking-wider">{user.role}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-800" />
                                    <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer rounded-lg text-sm px-2 py-2">
                                        👤 Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer rounded-lg text-sm px-2 py-2">
                                        ⚙️ Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-800" />
                                    <DropdownMenuItem onClick={logout}
                                        className="hover:bg-red-950/40 text-red-400 focus:text-red-400 cursor-pointer rounded-lg text-sm px-2 py-2">
                                        ⏻ Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* 🌟 FIXED MAIN DASHBOARD PERFECT CENTERING: Uses flex-col + items-center + strict max-width */}
                <main className="flex-1  overflow-y-auto w-full flex flex-col items-center focus:outline-none ">
                    <div className=" max-w-7xl w-full flex flex-col gap-4 px-6 md:px-10 py-8 space-y-8">

                        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-800
              border border-blue-900/20 px-9 py-9 shadow-md">
                            <div className="absolute right-2 top-2 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                            <div className="absolute right-12 bottom-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl translate-y-1/2" />
                            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="mt-2 mb-2 mx-2 my-2">
                                    <p className="text-slate-300 text-sm mb-1 py-4 font-medium">Good day,</p>
                                    <h2 className="text-xl sm:text-2xl p-4 font-extrabold text-slate-900 tracking-tight leading-tight">
                                        {user.fullName} 👋
                                    </h2>
                                    <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-md font-medium leading-relaxed">
                                        {isManager
                                            ? `${stats?.pendingBookings ?? 0} bookings pending approval · ${stats?.activeVoyages ?? 0} voyages active`
                                            : 'View your bookings and voyage status below.'}
                                    </p>
                                </div>
                                <div className="flex gap-2.5 flex-shrink-0 items-center">
                                    <Button
                                        onClick={() => router.push('/ships')}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-500 text-slate-900 rounded-xl text-xs font-semibold px-4 h-9 shadow-md shadow-blue-600/10"
                                    >
                                        🚢 Fleet
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/tracking')}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-800 bg-slate-400 hover:bg-slate-800 text-slate-600 hover:text-slate-400 rounded-xl text-xs font-semibold px-4 h-9"
                                    >
                                        🗺️ Track
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* ── Fleet Operational Metrics Block ── */}
                        {isManager && (
                            <div className="space-y-6 flex flex-col gap-4">
                                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest pl-1">
                                    Fleet Operational Metrics
                                </h3>

                                {loading || (!stats && !error) ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="bg-slate-300 border border-slate-200 rounded-2xl h-[145px] animate-pulse" />
                                        ))}
                                    </div>
                                ) : error ? (
                                    <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                                        Operational dashboard dataset unreadable. Please refresh.
                                    </div>
                                ) : stats ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
                                            <StatCard
                                                icon="🚢" label="Total Vessels" accent="bg-blue-500"
                                                value={stats.totalShips}
                                                sub={`${stats.shipsUnderWay} underway`}
                                                trend="+0%"
                                            />
                                            <StatCard
                                                icon="⚓" label="Active Voyages" accent="bg-purple-500"
                                                value={stats.activeVoyages}
                                                sub={`${stats.totalVoyagesThisMonth} this month`}
                                            />
                                            <StatCard
                                                icon="📋" label="Pending Bookings" accent="bg-red-500"
                                                value={stats.pendingBookings}
                                                sub="Awaiting approval"
                                            />
                                            <StatCard
                                                icon="💰" label="Monthly Cost" accent="bg-yellow-500"
                                                value={`$${(stats.totalCostThisMonth / 1000).toFixed(1)}k`}
                                                sub={`Fuel + maintenance`}
                                            />
                                        </div>

                                        <div className="space-y-5 mb-3 pt-2">
                                            <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest pl-1">
                                                Live Operations Status
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
                                                {[
                                                    { icon: '🏗️', label: 'In Port', value: stats.shipsInPort, sub: `${stats.shipsAnchored} anchored`, color: 'bg-emerald-400' },
                                                    { icon: '👨‍✈️', label: 'Captains', value: stats.totalCaptains, sub: `${stats.availableCaptains} available`, color: 'bg-red-500' },
                                                    { icon: '🌍', label: 'Global Ports', value: stats.totalPorts, sub: 'Worldwide network', color: 'bg-orange-400' },
                                                    { icon: '⛽', label: 'Fuel This Month', value: `${stats.totalFuelQuantityThisMonth.toFixed(0)} MT`, sub: `$${stats.totalFuelCostThisMonth.toFixed(0)}`, color: 'bg-violet-400' },
                                                ].map((s, i) => (
                                                    <div key={i} className="">
                                                        {/* <div className="flex flex-col gap-2 items-center justify-center">
                                                            <p className="text-slate-600 text-xl  font-semibold uppercase tracking-wider">{s.label}</p>
                                                            <span className="text-2xl bg-slate-800/30 p-1.5 rounded-xl border border-slate-800/40">{s.icon}</span>
                                                        </div>
                                                        <div className="mt-4">
                                                            <p className={`font-extrabold text-2xl tracking-tight leading-none ${s.color}`}>{s.value}</p>
                                                            <p className="text-slate-500 text-xs mt-1.5 truncate font-medium">{s.sub}</p>
                                                        </div> */}

                                                         <StatCard
                                                icon={s.icon} label={s.label} accent={s.color}
                                                value={s.value}
                                                sub={s.sub}
                                            />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── CHARTS CONTAINER SECTION: Fully responsive, clean padded blocks ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 bg-slate-300 border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col">
                                                <div className="flex-col sm:flex-row  sm:items-center justify-center text-center gap-1 items-center px-6 pt-5 pb-4 border-b border-slate-200 ">
                                                    <div>
                                                        <h3 className="text-slate-900 font-bold text-sm tracking-tight">Analytics</h3>
                                                        <p className="text-slate-500 text-xs mt-0.5 font-medium">6-month performance indicators</p>
                                                    </div>
                                                    <div className="flex justify-center gap-2  bg-slate-800/40 rounded-xl p-1 border border-slate-200 self-start sm:self-auto">
                                                        {(['costs', 'voyages'] as const).map(v => (
                                                            <button key={v} onClick={() => setActiveChart(v)}
                                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeChart === v
                                                                        ? 'bg-blue-600 text-slate-900 shadow'
                                                                        : 'text-slate-600 hover:text-slate-900'
                                                                    }`}>
                                                                {v === 'costs' ? '💰 Costs' : '⚓ Voyages'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-6 flex-1 min-h-[280px]">
                                                    {activeChart === 'costs' ? (
                                                        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                                                            <AreaChart data={stats.monthlyStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="gFuel" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                                    </linearGradient>
                                                                    <linearGradient id="gMaint" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                                <Tooltip
                                                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                                                                    labelStyle={{ color: '#e2e8f0' }}
                                                                />
                                                                <Area type="monotone" dataKey="fuelCost" stroke="#3b82f6" strokeWidth={2} fill="url(#gFuel)" name="Fuel Cost" />
                                                                <Area type="monotone" dataKey="maintenanceCost" stroke="#f59e0b" strokeWidth={2} fill="url(#gMaint)" name="Maintenance" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                                                            <BarChart data={stats.monthlyStats} barSize={16} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                                <Tooltip
                                                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                                                                    labelStyle={{ color: '#e2e8f0' }}
                                                                />
                                                                <Bar dataKey="totalVoyages" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Voyages" />
                                                                <Bar dataKey="fuelQuantityMT" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Fuel MT" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-slate-300 border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col">
                                                <div className="px-6 pt-5 pb-4 items-center text-center border-b border-slate-200">
                                                    <h3 className="text-slate-900 font-bold text-sm tracking-tight">Fleet Status</h3>
                                                    <p className="text-slate-500 text-xs mt-0.5 font-medium">Current distribution layout</p>
                                                </div>
                                                <div className="p-6 flex-1 flex items-center justify-center min-h-[280px]">
                                                    {pieData.length === 0 ? (
                                                        <div className="text-slate-600 text-sm">No data yet</div>
                                                    ) : (
                                                        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                                                            <PieChart>
                                                                <Pie data={pieData} cx="50%" cy="40%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                                                                    {pieData.map((_, i) => (
                                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} />
                                                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} formatter={v => <span className="text-slate-600 text-xs font-medium">{v}</span>} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="bg-slate-300 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                <div className="px-5 pt-4 pb-3 border-b border-slate-200 flex flex-col items-center justify-center text-center gap-1">
                                                    <div>
                                                        <h3 className="text-slate-900 font-bold text-sm tracking-tight">Top Cost Vessels</h3>
                                                        <p className="text-slate-500 text-xs mt-0.5 font-medium">Highest operating expenses</p>
                                                    </div>
                                                    <span className="text-slate-600 text-xs font-semibold bg-slate-800/40 border border-slate-200 rounded-md px-2 py-0.5">All time</span>
                                                </div>
                                                <div className="p-3">
                                                    {stats.topCostShips.length === 0 ? (
                                                        <div className="py-8 text-center text-slate-600 text-sm">
                                                            No cost data yet
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            {stats.topCostShips.slice(0, 5).map((ship, i) => (
                                                                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors group">
                                                                    <div className="w-7 h-7 rounded bg-slate-800 border border-cyan-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                                                        {i + 1}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-slate-700 hover:text-slate-300 text-sm font-medium truncate">{ship.shipName}</p>
                                                                        <p className="text-slate-600 text-xs mt-0.5 font-medium">{ship.imoNumber}</p>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <p className="text-slate-900 text-sm font-bold">${ship.totalCost.toFixed(0)}</p>
                                                                        <div className="flex gap-2 justify-end mt-1">
                                                                            <span className="text-blue-400 text-[10px] font-medium">⛽ ${ship.fuelCost.toFixed(0)}</span>
                                                                            <span className="text-yellow-400 text-[10px] font-medium">🔧 ${ship.maintenanceCost.toFixed(0)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-slate-300 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                <div className="px-5 pt-4 pb-3 border-b border-slate-200 flex flex-col items-center text-center gap-1 justify-center">
                                                    <div>
                                                        <h3 className="text-slate-900 font-bold text-sm tracking-tight">Live Positions</h3>
                                                        <p className="text-slate-500 text-xs mt-0.5 font-medium">Current active GPS coordinates</p>
                                                    </div>
                                                    <button
                                                        onClick={() => router.push('/tracking')}
                                                        className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors"
                                                    >
                                                        View map →
                                                    </button>
                                                </div>
                                                <ScrollArea className="h-80">
                                                    <div className="p-3 space-y-1.5">
                                                        {stats.shipPositions.map(ship => {
                                                            const colors: Record<string, string> = {
                                                                UnderWay: '#3b82f6', InPort: '#22c55e',
                                                                Anchored: '#f59e0b', UnderMaintenance: '#ef4444',
                                                            };
                                                            const c = colors[ship.status] || '#6b7280';
                                                            return (
                                                                <div key={ship.shipId}
                                                                    onClick={() => router.push('/tracking')}
                                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer"
                                                                >
                                                                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                                                                        style={{ backgroundColor: c, boxShadow: ship.status === 'UnderWay' ? `0 0 6px ${c}` : 'none' }}
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-slate-700 text-sm font-medium truncate">{ship.shipName}</p>
                                                                        <p className="text-slate-600 text-xs mt-0.5 font-medium">{ship.imoNumber}</p>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0">
                                                                        <Badge variant="outline" className="text-[10px] mb-1 font-semibold" style={{ borderColor: c + '40', color: c }}>
                                                                            {ship.status}
                                                                        </Badge>
                                                                        <p className="text-slate-500 text-[10px] font-medium">
                                                                            {ship.latitude?.toFixed(2)}°, {ship.longitude?.toFixed(2)}°
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* ── Quick Access Controls Grid Area ── */}
                        <div className="space-y-3">
                            <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest pl-1">
                                Quick Access Subsystems
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {NAV.filter(n => n.path !== '/dashboard' && n.roles.includes(user.role)).map(item => (
                                    <button
                                        key={item.path}
                                        onClick={() => router.push(item.path)}
                                        className="relative flex flex-col items-center justify-center text-center gap-2.5 p-4
                      bg-slate-300 border border-slate-200
                      hover:border-cyan-200 hover:bg-slate-800/30
                      rounded-2xl transition-all hover:-translate-y-0.5 group shadow-sm"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform duration-150">
                                            {item.icon}
                                        </span>
                                        <span className="text-slate-600 group-hover:text-slate-200 text-xs font-semibold tracking-wide leading-tight transition-colors">
                                            {item.label}
                                        </span>
                                        {item.label === 'Bookings' && (stats?.pendingBookings ?? 0) > 0 && (
                                            <span className="absolute top-2 right-2 bg-red-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {stats?.pendingBookings}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}








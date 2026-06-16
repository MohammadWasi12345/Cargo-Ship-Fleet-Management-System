


'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV = [
  { icon: '▣',  label: 'Dashboard',    path: '/dashboard',   roles: ['Admin','FleetManager','Captain','Employee','Customer'] },
  { icon: '🚢', label: 'Fleet',         path: '/ships',       roles: ['Admin','FleetManager','Captain','Employee','Customer'] },
  { icon: '🗺️',  label: 'Live Tracking', path: '/tracking',    roles: ['Admin','FleetManager','Captain'] },
  { icon: '⚓',  label: 'Voyages',       path: '/voyages',     roles: ['Admin','FleetManager','Captain'] },
  { icon: '📋',  label: 'Bookings',      path: '/bookings',    roles: ['Admin','FleetManager','Employee','Customer'] },
  { icon: '👨‍✈️',  label: 'Captains',      path: '/captains',    roles: ['Admin','FleetManager'] },
  { icon: '⛽',  label: 'Fuel Logs',     path: '/fuel',        roles: ['Admin','FleetManager','Captain'] },
  { icon: '🔧',  label: 'Maintenance',   path: '/maintenance', roles: ['Admin','FleetManager'] },
  { icon: '🏗️',  label: 'Ports',         path: '/ports',       roles: ['Admin','FleetManager'] },
  { icon: '👥',  label: 'Users',         path: '/users',       roles: ['Admin'] },
  { icon: '🔐',  label: 'Audit Logs',    path: '/audit',       roles: ['Admin'] },
];

function SidebarInner({ pendingBookings, onNavigate }: { pendingBookings?: number; onNavigate: (p: string) => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user) return null;
  const filtered = NAV.filter(n => n.roles.includes(user.role));

  return (
    <div className="flex flex-col gap-3 h-full w-full bg-slate-100 border-r border-slate-200">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center flex-shrink-0 border-b border-slate-200">
        <button onClick={() => onNavigate('/dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            ⚓
          </div>
          <div className="text-left">
            <p className="text-slate-900 font-bold text-sm leading-none">Maritime Fleet</p>
            <p className="text-slate-400 text-[10px] mt-0.5 font-semibold tracking-widest uppercase">Operational Hub</p>
          </div>
        </button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 gap-3 py-3 px-3">
        <div className="space-y-0.5 flex flex-col gap-3">
          {pathname !== '/dashboard' && (
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold tracking-wider text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all mb-2 uppercase"
            >
              <span className="material-symbols-outlined text-[18px]"></span>
              Back to Dashboard
            </button>
          )}
          {filtered.map(item => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] leading-none">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.label === 'Bookings' && (pendingBookings ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingBookings}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>


      {/* User */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-sm font-semibold truncate leading-none">{user.fullName}</p>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{user.role}</p>
          </div>
          <button onClick={logout} title="Sign out"
            className="text-slate-500 hover:text-red-500 transition-colors opacity-50 group-hover:opacity-100 p-1 flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PageLayout({
  children, title, subtitle, actions, pendingBookings,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  pendingBookings?: number;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;
  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className="flex gap-3 h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0">
        <SidebarInner pendingBookings={pendingBookings} onNavigate={handleNavigate} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm"
            className="lg:hidden fixed top-3 left-3 z-50 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg p-2 h-9 w-9 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-slate-200 bg-white">
          <SidebarInner pendingBookings={pendingBookings} onNavigate={handleNavigate} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="h-full max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 flex-shrink-0 lg:hidden" />
              <div className="min-w-0">
                <h1 className="text-slate-900 font-bold text-base leading-none truncate">{title}</h1>
                {subtitle && <p className="text-slate-500 text-xs mt-0.5 hidden sm:block truncate">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="text-slate-700 text-sm font-medium hidden md:block">{user.fullName.split(' ')[0]}</span>
                    <span className="text-slate-400 text-xs hidden md:block">▾</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-800 w-44 rounded-xl p-1.5 shadow-lg">
                  <DropdownMenuLabel className="text-slate-400 text-xs px-2 py-1.5 font-semibold">{user.role}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}
                    className="hover:bg-slate-50 cursor-pointer rounded-lg text-sm px-2 py-2 text-slate-700">
                    <span className="material-symbols-outlined text-[16px] mr-2">dashboard</span> 
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={logout}
                    className="hover:bg-red-50 text-red-500 cursor-pointer rounded-lg text-sm px-2 py-2">
                    <span className="material-symbols-outlined text-[16px] mr-2">logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
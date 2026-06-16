
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShipPosition {
  shipId: string;
  shipName: string;
  imoNumber: string;
  status: string;
  type: string;
  latitude: number;
  longitude: number;
  speedKnots: number;
  heading: number;
  lastUpdate: string;
}

const STATUS_COLORS: Record<string, string> = {
  UnderWay: '#2563eb', // Clean Blue
  InPort: '#16a34a',   // Clean Green
  Anchored: '#d97706', // Clean Orange/Yellow
  UnderMaintenance: '#dc2626', // Clean Red
  OutOfService: '#4b5563',     // Clean Gray
};

const STATUS_BG: Record<string, string> = {
  UnderWay: 'bg-blue-50 text-blue-700 border-blue-200',
  InPort: 'bg-green-50 text-green-700 border-green-200',
  Anchored: 'bg-amber-50 text-amber-700 border-amber-200',
  UnderMaintenance: 'bg-red-50 text-red-700 border-red-200',
  OutOfService: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function TrackingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ships, setShips] = useState<ShipPosition[]>([]);
  const [selectedShip, setSelectedShip] = useState<ShipPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const markersRef = useRef<Record<string, unknown>>({});

  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get('/tracking/fleet');
      setShips(res.data);
      setLastRefresh(new Date());
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const timer = setTimeout(() => fetchPositions(), 0);
    return () => clearTimeout(timer);
  }, [user, router, fetchPositions]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchPositions(), 30000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  // Load Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || mapLoaded || !mapRef.current) return;

    const loadMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (leafletMapRef.current) return;

      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
      });

      // Light/Standard Map layer for Light Theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
      setMapLoaded(true);
    };

    loadMap();
  }, [mapLoaded]);

  // Add/update markers when ships or map changes
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current || ships.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = leafletMapRef.current as ReturnType<typeof L.map>;

      ships.forEach(ship => {
        if (!ship.latitude || !ship.longitude) return;

        const color = STATUS_COLORS[ship.status] || '#4b5563';

        // Ship icon SVG (Optimized for light map)
        const shipIcon = L.divIcon({
          html: `
            <div style="position:relative;">
              <div style="
                width: 36px; height: 36px;
                background: ${color}15;
                border: 2px solid ${color};
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 8px ${color}30;
                cursor: pointer;
              ">🚢</div>
              ${ship.status === 'UnderWay' ? `
                <div style="
                  position: absolute; top: -2px; right: -2px;
                  width: 10px; height: 10px;
                  background: #16a34a;
                  border-radius: 50%;
                  border: 2px solid #ffffff;
                  animation: pulse 2s infinite;
                "></div>
              ` : ''}
            </div>
          `,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const popupContent = `
          <div style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            min-width: 200px;
            font-family: sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          ">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span style="font-size:20px;">🚢</span>
              <div>
                <p style="color:#0f172a; font-weight:700; font-size:14px; margin:0;">${ship.shipName}</p>
                <p style="color:#64748b; font-size:11px; margin:0;">${ship.imoNumber}</p>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div style="background:#f8fafc; border-radius:8px; padding:8px; border: 1px solid #f1f5f9;">
                <p style="color:#64748b; font-size:10px; margin:0;">STATUS</p>
                <p style="color:${color}; font-size:12px; font-weight:600; margin:0;">${ship.status}</p>
              </div>
              <div style="background:#f8fafc; border-radius:8px; padding:8px; border: 1px solid #f1f5f9;">
                <p style="color:#64748b; font-size:10px; margin:0;">TYPE</p>
                <p style="color:#334155; font-size:12px; font-weight:600; margin:0;">${ship.type}</p>
              </div>
              <div style="background:#f8fafc; border-radius:8px; padding:8px; border: 1px solid #f1f5f9;">
                <p style="color:#64748b; font-size:10px; margin:0;">SPEED</p>
                <p style="color:#2563eb; font-size:12px; font-weight:600; margin:0;">${ship.speedKnots || '—'} kts</p>
              </div>
              <div style="background:#f8fafc; border-radius:8px; padding:8px; border: 1px solid #f1f5f9;">
                <p style="color:#64748b; font-size:10px; margin:0;">POSITION</p>
                <p style="color:#334155; font-size:11px; font-weight:600; margin:0;">${ship.latitude?.toFixed(3)}°, ${ship.longitude?.toFixed(3)}°</p>
              </div>
            </div>
          </div>
        `;

        if (markersRef.current[ship.shipId]) {
          const marker = markersRef.current[ship.shipId] as ReturnType<typeof L.marker>;
          marker.setLatLng([ship.latitude, ship.longitude]);
          marker.setIcon(shipIcon);
        } else {
          const marker = L.marker([ship.latitude, ship.longitude], { icon: shipIcon })
            .addTo(map)
            .bindPopup(popupContent, {
              className: 'custom-popup',
              maxWidth: 250,
            });

          marker.on('click', () => {
            setSelectedShip(ship);
          });

          markersRef.current[ship.shipId] = marker;
        }
      });
    };

    updateMarkers();
  }, [ships, mapLoaded]);

  // Focus map on selected ship
  const focusShip = async (ship: ShipPosition) => {
    setSelectedShip(ship);
    if (!leafletMapRef.current || !ship.latitude) return;
    const L = (await import('leaflet')).default;
    const map = leafletMapRef.current as ReturnType<typeof L.map>;
    map.flyTo([ship.latitude, ship.longitude], 6, { duration: 1.5 });
    const marker = markersRef.current[ship.shipId] as ReturnType<typeof L.marker>;
    if (marker) marker.openPopup();
  };

  if (!user) return null;

  const underWayShips = ships.filter(s => s.status === 'UnderWay');
  const inPortShips = ships.filter(s => s.status === 'InPort');

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">

      {/* ── Left Panel ── */}
      <div className="w-80 shrink-0 flex flex-col gap-3 border-r border-slate-200 bg-white shadow-sm z-10">

        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                ←
              </button>
              <h1 className="text-slate-900 font-bold text-lg">Live Tracking</h1>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchPositions}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 h-8"
            >
              🔄
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-blue-600 font-bold text-lg leading-none">{ships.length}</p>
              <p className="text-slate-500 text-xs mt-1 font-medium">Total</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-green-600 font-bold text-lg leading-none">{underWayShips.length}</p>
              <p className="text-slate-500 text-xs mt-1 font-medium">Underway</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-amber-600 font-bold text-lg leading-none">{inPortShips.length}</p>
              <p className="text-slate-500 text-xs mt-1 font-medium">In Port</p>
            </div>
          </div>

          {/* Last refresh */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-slate-400 text-xs font-medium">
              Updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Ship list */}
        <Tabs defaultValue="all" className="flex-1 gap-4 flex flex-col overflow-hidden">
          <TabsList className="mx-3 mt-1 mb-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 text-xs font-semibold rounded-lg py-1.5">
              All ({ships.length})
            </TabsTrigger>
            <TabsTrigger value="underway" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 text-xs font-semibold rounded-lg py-1.5">
              Underway ({underWayShips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-3 pb-3">
              {/* `space-y-4` adds clean spacing between cards */}
              <div className=" flex flex-col gap-4 py-1">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : ships.map(ship => (
                  <div
                    key={ship.shipId}
                    onClick={() => focusShip(ship)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm ${
                      selectedShip?.shipId === ship.shipId
                        ? 'border-blue-800 bg-blue-100/40 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: STATUS_COLORS[ship.status] + '10', border: `1px solid ${STATUS_COLORS[ship.status]}20` }}
                      >
                        🚢
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-slate-900 font-bold text-sm truncate">{ship.shipName}</p>
                          <Badge variant="outline" className={`text-xs font-semibold flex-shrink-0 shadow-sm ${STATUS_BG[ship.status]}`}>
                            {ship.status === 'UnderWay' ? '▶' : ship.status === 'InPort' ? '⚓' : '⏸'} {ship.status}
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 font-medium">{ship.imoNumber} • {ship.type}</p>
                        {ship.latitude && (
                          <p className="text-slate-500 text-xs mt-1.5 bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                            📍 {ship.latitude?.toFixed(3)}°, {ship.longitude?.toFixed(3)}°
                          </p>
                        )}
                        {ship.speedKnots > 0 && (
                          <p className="text-blue-600 font-semibold text-xs mt-1.5 flex items-center gap-1">⚡ {ship.speedKnots} knots</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="underway" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-3 pb-3">
              {/* `space-y-4` adds clean spacing between cards */}
              <div className="space-y-4 py-1">
                {underWayShips.map(ship => (
                  <div
                    key={ship.shipId}
                    onClick={() => focusShip(ship)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      selectedShip?.shipId === ship.shipId
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-bold text-sm truncate">{ship.shipName}</p>
                        <p className="text-slate-500 text-xs font-medium">{ship.imoNumber}</p>
                      </div>
                      <p className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{ship.speedKnots || '—'} kts</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Map + Detail Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Map */}
        <div className="flex-1 relative">
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ background: '#f8fafc' }}
          />

          {/* Map overlay — loading */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[2000]">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map legend */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-3.5 z-[1000]">
            <p className="text-slate-400 text-[10px] font-bold mb-2.5 uppercase tracking-wider">Legend</p>
            <div className="space-y-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-slate-600 text-xs font-medium">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ship count overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl px-3 py-2 z-[1000]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-slate-800 text-sm font-semibold">{ships.length} vessels tracked</p>
            </div>
          </div>
        </div>

        {/* ── Selected Ship Detail ── */}
        {selectedShip && (
          <div className="flex-shrink-0 border-t border-slate-500 bg-slate-50 p-4 shadow-lg z-10 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor: STATUS_COLORS[selectedShip.status] + '15',
                  border: `1px solid ${STATUS_COLORS[selectedShip.status]}30`
                }}
              >
                🚢
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2.5">
                  <h3 className="text-slate-900 font-bold text-base">{selectedShip.shipName}</h3>
                  <Badge variant="outline" className={`font-semibold ${STATUS_BG[selectedShip.status]}`}>
                    {selectedShip.status}
                  </Badge>
                  <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 text-xs font-medium">
                    {selectedShip.type}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-slate-400 text-xs font-medium">IMO Number</p>
                    <p className="text-slate-800 text-sm font-bold mt-0.5">{selectedShip.imoNumber}</p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5">
                    <p className="text-blue-500 text-xs font-medium">Speed</p>
                    <p className="text-blue-700 text-sm font-bold mt-0.5">{selectedShip.speedKnots || '—'} knots</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-slate-400 text-xs font-medium">Latitude</p>
                    <p className="text-slate-800 text-sm font-bold mt-0.5">{selectedShip.latitude?.toFixed(4)}°</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-slate-400 text-xs font-medium">Longitude</p>
                    <p className="text-slate-800 text-sm font-bold mt-0.5">{selectedShip.longitude?.toFixed(4)}°</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedShip(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-lg flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
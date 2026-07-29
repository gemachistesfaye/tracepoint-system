import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from "react-leaflet";
import { HARAMAYA_CENTER, CAMPUS_LOCATIONS } from "../map/CampusMap";
import { useItems } from "../../context/ItemsContext";
import { MapPin } from "lucide-react";

const getRadius = (count) => {
  if (count === 0) return 0;
  if (count <= 2) return 8;
  if (count <= 5) return 12;
  if (count <= 10) return 18;
  return 24;
};

const getColor = (count) => {
  if (count === 0) return "#d1d5db";
  if (count <= 2) return "#fbbf24";
  if (count <= 5) return "#f97316";
  if (count <= 10) return "#ef4444";
  return "#dc2626";
};

const HeatMap = () => {
  const { items } = useItems();

  const locationStats = useMemo(() => {
    const lost = items.filter(i => i.type === "lost");
    const found = items.filter(i => i.type === "found");
    const resolved = items.filter(i => i.status === "resolved");

    return Object.entries(CAMPUS_LOCATIONS).map(([name, coords]) => {
      const locationItems = items.filter(i => i.location === name);
      const locationLost = lost.filter(i => i.location === name);
      const locationFound = found.filter(i => i.location === name);
      const locationResolved = resolved.filter(i => i.location === name);
      return {
        name,
        coords,
        total: locationItems.length,
        lost: locationLost.length,
        found: locationFound.length,
        resolved: locationResolved.length,
        recoveryRate: locationItems.length > 0
          ? Math.round((locationResolved.length / locationItems.length) * 100)
          : 0,
      };
    }).filter(l => l.total > 0).sort((a, b) => b.total - a.total);
  }, [items]);

  const totalLost = items.filter(i => i.type === "lost").length;
  const totalFound = items.filter(i => i.type === "found").length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary-500" />
            <h3 className="font-bold text-gray-900 text-sm">Campus Heat Map</h3>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Lost</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Found</span>
          </div>
        </div>
        <div className="h-[400px]">
          <MapContainer
            center={HARAMAYA_CENTER}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <ZoomControl position="topright" />
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locationStats.map(loc => (
              <CircleMarker
                key={loc.name}
                center={loc.coords}
                radius={getRadius(loc.total)}
                fillColor={getColor(loc.total)}
                fillOpacity={0.7}
                color="#fff"
                weight={2}
              >
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-bold text-gray-900 mb-1">{loc.name}</p>
                    <div className="space-y-0.5 text-xs">
                      <p><span className="text-gray-500">Total:</span> <span className="font-bold">{loc.total}</span></p>
                      <p><span className="text-red-500">Lost:</span> {loc.lost}</p>
                      <p><span className="text-emerald-500">Found:</span> {loc.found}</p>
                      <p><span className="text-gray-500">Resolved:</span> {loc.resolved}</p>
                      <p className="pt-1 border-t border-gray-100">
                        <span className="text-gray-500">Recovery:</span> <span className="font-bold text-primary-600">{loc.recoveryRate}%</span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Building Statistics</h3>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {locationStats.slice(0, 12).map((loc, i) => {
              const maxVal = locationStats[0]?.total || 1;
              const pct = Math.round((loc.total / maxVal) * 100);
              return (
                <div key={loc.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-700 font-medium truncate">{loc.name}</span>
                      <span className="text-xs font-bold text-gray-900">{loc.total}</span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      <div className="bg-red-400 rounded-full" style={{ width: `${loc.total > 0 ? (loc.lost / loc.total) * pct : 0}%` }} />
                      <div className="bg-emerald-400 rounded-full" style={{ width: `${loc.total > 0 ? (loc.found / loc.total) * pct : 0}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Lost ({totalLost})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Found ({totalFound})</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Heat Legend</h3>
          <div className="space-y-3">
            {[
              { label: "High activity (10+ items)", color: "#dc2626", radius: 24 },
              { label: "Medium activity (5-10)", color: "#ef4444", radius: 18 },
              { label: "Low activity (2-5)", color: "#f97316", radius: 12 },
              { label: "Minimal activity (1-2)", color: "#fbbf24", radius: 8 },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-3">
                <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
                  <div className="rounded-full border-2 border-white" style={{
                    width: l.radius * 1.5,
                    height: l.radius * 1.5,
                    backgroundColor: l.color,
                    opacity: 0.7,
                  }} />
                </div>
                <span className="text-xs text-gray-600">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">
              <span className="font-bold">Tip:</span> Click any circle on the map to see detailed building statistics.
              Size and color intensity represent item report density.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;

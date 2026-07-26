import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const HARAMAYA_CENTER = [9.4233, 42.0372];

export const CAMPUS_LOCATIONS = {
  // ── Main Campus ───────────────────────────────────────────────
  "Main University Gate":          [9.4282, 42.0372],
  "Administration Building":       [9.4270, 42.0355],
  "Main Library":                  [9.4265, 42.0368],
  "Student Cafeteria":             [9.4260, 42.0362],
  "College of Computing":          [9.4250, 42.0362],
  "College of Agriculture":        [9.4255, 42.0340],
  "Health Center":                 [9.4260, 42.0378],
  "Post Office":                   [9.4278, 42.0365],
  "Parking Area":                  [9.4280, 42.0358],
  "Dormitory Area":                [9.4275, 42.0342],
  "University Stadium":            [9.4290, 42.0318],
  "University Academy":            [9.4285, 42.0328],
  "Research Farm 1":               [9.4245, 42.0325],
  "Research Farm 2":               [9.4245, 42.0395],
  "Sumeya Mosque":                 [9.4182, 42.0355],
  "Haramaya Lake":                 [9.4150, 42.0420],
  // ── HIT Campus (Haramaya Institute of Technology) ─────────────
  "HIT Main Building":             [9.4218, 42.0380],
  "HIT Library":                   [9.4222, 42.0375],
  "HIT Laboratory":                [9.4214, 42.0388],
  "HIT Cafeteria":                 [9.4225, 42.0368],
  "HIT Dormitory":                 [9.4210, 42.0395],
  "HIT Gate":                      [9.4208, 42.0372],
  // ── Veterinary Campus ─────────────────────────────────────────
  "Veterinary Faculty":            [9.4230, 42.0345],
  "Veterinary Clinic":             [9.4225, 42.0338],
  "Veterinary Laboratory":         [9.4235, 42.0332],
  "Veterinary Dormitory":          [9.4220, 42.0328],
  "Veterinary Gate":               [9.4240, 42.0322],
};

// Campus zones for visual grouping
const ZONES = {
  main: {
    label: "Main Campus",
    color: "#2563eb",
    keys: ["Main University Gate","Administration Building","Main Library","Student Cafeteria",
           "College of Computing","College of Agriculture","Health Center","Post Office",
           "Parking Area","Dormitory Area","University Stadium","University Academy",
           "Research Farm 1","Research Farm 2","Sumeya Mosque","Haramaya Lake"],
  },
  hit: {
    label: "HIT Campus",
    color: "#7c3aed",
    keys: ["HIT Main Building","HIT Library","HIT Laboratory","HIT Cafeteria","HIT Dormitory","HIT Gate"],
  },
  vet: {
    label: "Veterinary Campus",
    color: "#059669",
    keys: ["Veterinary Faculty","Veterinary Clinic","Veterinary Laboratory","Veterinary Dormitory","Veterinary Gate"],
  },
};

const getZoneColor = (name) => {
  for (const zone of Object.values(ZONES)) {
    if (zone.keys.includes(name)) return zone.color;
  }
  return "#64748b";
};

const CampusMap = ({
  selectedLocation,
  onLocationSelect,
  items = [],
  height = "400px",
  readOnly = false,
  showFilter = false,
}) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const itemMarkersRef = useRef([]);
  const [filterType, setFilterType] = useState("all"); // all | lost | found
  const [activeZone, setActiveZone] = useState("all");

  const buildMap = () => {
    if (leafletMapRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: HARAMAYA_CENTER,
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Tile layers
    const streetLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap © CARTO", subdomains: "abcd", maxZoom: 20 }
    );
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri", maxZoom: 20 }
    );
    streetLayer.addTo(map);
    L.control.layers({ "🗺️ Map": streetLayer, "🛰️ Satellite": satelliteLayer }, {}, { position: "topright" }).addTo(map);

    // Zone outlines
    Object.entries(ZONES).forEach(([key, zone]) => {
      const coords = zone.keys.map(n => CAMPUS_LOCATIONS[n]).filter(Boolean);
      if (coords.length < 3) return;
      const lats = coords.map(c => c[0]);
      const lngs = coords.map(c => c[1]);
      const center = [(Math.min(...lats) + Math.max(...lats)) / 2,
                      (Math.min(...lngs) + Math.max(...lngs)) / 2];
      const radius = Math.max(
        ...coords.map(c => Math.hypot(c[0] - center[0], c[1] - center[1]) * 111000)
      ) + 80;

      L.circle(center, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: "6 4",
        radius,
      }).addTo(map).bindTooltip(zone.label, { permanent: false, className: "tp-tooltip-light" });
    });

    // Location markers
    Object.entries(CAMPUS_LOCATIONS).forEach(([name, coords]) => {
      const isSelected = selectedLocation === name;
      const zoneColor = getZoneColor(name);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          display:flex;flex-direction:column;align-items:center;cursor:pointer;
        ">
          <div style="
            width:${isSelected ? 18 : 11}px;
            height:${isSelected ? 18 : 11}px;
            background:${isSelected ? zoneColor : zoneColor + "cc"};
            border:2.5px solid ${isSelected ? "white" : "rgba(255,255,255,0.85)"};
            border-radius:50%;
            box-shadow:${isSelected ? `0 0 0 4px ${zoneColor}40, 0 4px 12px rgba(0,0,0,0.3)` : "0 2px 6px rgba(0,0,0,0.2)"};
            transition:all 0.2s;
          "></div>
          ${isSelected ? `<div style="
            margin-top:4px;background:white;color:${zoneColor};
            font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px;
            border:1px solid ${zoneColor}44;white-space:nowrap;max-width:120px;
            text-align:center;overflow:hidden;text-overflow:ellipsis;
            box-shadow:0 2px 8px rgba(0,0,0,0.15);
          ">${name}</div>` : ""}
        </div>`,
        iconSize: [isSelected ? 130 : 11, isSelected ? 44 : 11],
        iconAnchor: [isSelected ? 65 : 5, isSelected ? 9 : 5],
      });

      const marker = L.marker(coords, { icon }).addTo(map)
        .bindTooltip(`📍 ${name}`, { direction: "top", className: "tp-tooltip-light", offset: [0, -10] });

      if (!readOnly && onLocationSelect) {
        marker.on("click", () => onLocationSelect(name));
      }

      markersRef.current[name] = marker;
    });

    leafletMapRef.current = map;
    renderItemMarkers(map, items, filterType);
  };

  const renderItemMarkers = (map, itemList, type) => {
    // Remove old item markers
    itemMarkersRef.current.forEach(m => map.removeLayer(m));
    itemMarkersRef.current = [];

    const offsets = {};
    const filtered = type === "all" ? itemList : itemList.filter(i => i.type === type);

    // Count items per location for badge
    const counts = {};
    filtered.forEach(item => {
      if (CAMPUS_LOCATIONS[item.location]) {
        counts[item.location] = (counts[item.location] || { lost: 0, found: 0 });
        counts[item.location][item.type]++;
      }
    });

    // Render count badges on location markers
    Object.entries(counts).forEach(([loc, cnt]) => {
      const coords = CAMPUS_LOCATIONS[loc];
      if (!coords) return;
      const total = cnt.lost + cnt.found;
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background:${cnt.lost > cnt.found ? "#ef4444" : "#10b981"};
          color:white;font-size:9px;font-weight:800;
          width:18px;height:18px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${total}</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker([coords[0] + 0.00012, coords[1] + 0.00012], { icon, zIndexOffset: 100 })
        .addTo(map)
        .bindTooltip(
          `${loc}: ${cnt.lost} lost, ${cnt.found} found`,
          { direction: "top", className: "tp-tooltip-light" }
        );
      itemMarkersRef.current.push(m);
    });

    // Individual item dots
    filtered.forEach(item => {
      const coords = CAMPUS_LOCATIONS[item.location];
      if (!coords) return;
      const key = item.location;
      offsets[key] = (offsets[key] || 0) + 1;
      const off = offsets[key] * 0.00007;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:11px;height:11px;
          background:${item.type === "lost" ? "#ef4444" : "#10b981"};
          border:2px solid white;border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          opacity:${item.status === "resolved" ? 0.4 : 1};
        "></div>`,
        iconSize: [11, 11], iconAnchor: [5, 5],
      });

      const m = L.marker([coords[0] + off, coords[1] + off], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:170px;font-family:system-ui,sans-serif">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="font-size:10px;font-weight:800;color:${item.type==="lost"?"#dc2626":"#059669"};
                background:${item.type==="lost"?"#fee2e2":"#d1fae5"};padding:2px 8px;border-radius:20px">
                ${item.type.toUpperCase()}
              </span>
              <span style="font-size:10px;color:#6b7280;text-transform:capitalize">${item.status}</span>
            </div>
            <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:#111827">${item.title}</p>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px">📂 ${item.category}</p>
            <p style="font-size:11px;color:#6b7280;margin:0 0 6px">📍 ${item.location}</p>
            <a href="/items/${item.id}" style="font-size:11px;color:#2563eb;font-weight:600">View Details →</a>
          </div>`, { className: "tp-popup-light" });

      itemMarkersRef.current.push(m);
    });
  };

  useEffect(() => { buildMap(); }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !selectedLocation) return;
    const coords = CAMPUS_LOCATIONS[selectedLocation];
    if (coords) leafletMapRef.current.flyTo(coords, 18, { duration: 1 });
  }, [selectedLocation]);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    renderItemMarkers(leafletMapRef.current, items, filterType);
  }, [items, filterType]);

  const lostCount = items.filter(i => i.type === "lost" && i.status !== "resolved").length;
  const foundCount = items.filter(i => i.type === "found" && i.status !== "resolved").length;

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      {showFilter && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-xl">
            {[
              { key: "all", label: `All (${items.filter(i=>i.status!=="resolved").length})` },
              { key: "lost", label: `🔴 Lost (${lostCount})` },
              { key: "found", label: `🟢 Found (${foundCount})` },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === f.key ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}>{f.label}</button>
            ))}
          </div>
          {/* Zone filter */}
          <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-xl">
            <button onClick={() => setActiveZone("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeZone==="all"?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700 hover:bg-white"}`}>
              All Zones
            </button>
            {Object.entries(ZONES).map(([key, zone]) => (
              <button key={key} onClick={() => {
                setActiveZone(key);
                if (leafletMapRef.current) {
                  const coords = zone.keys.map(n => CAMPUS_LOCATIONS[n]).filter(Boolean);
                  if (coords.length) {
                    const lats = coords.map(c => c[0]);
                    const lngs = coords.map(c => c[1]);
                    leafletMapRef.current.flyTo(
                      [(Math.min(...lats)+Math.max(...lats))/2, (Math.min(...lngs)+Math.max(...lngs))/2],
                      17, { duration: 1 }
                    );
                  }
                }
              }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeZone===key ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}
                style={activeZone===key ? { background: zone.color } : {}}>
                {zone.label}
              </button>
            ))}
          </div>
          {/* Legend */}
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"/>Lost item</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"/>Found item</span>
            <span className="flex items-center gap-1 text-blue-600"><span className="font-black">3</span> Count badge</span>
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{ height }} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        <style>{`
          .tp-tooltip-light {
            background:white!important;border:1px solid #e2e8f0!important;color:#1e293b!important;
            font-size:11px!important;font-weight:700!important;border-radius:8px!important;
            padding:4px 10px!important;box-shadow:0 4px 16px rgba(0,0,0,0.12)!important;
          }
          .tp-tooltip-light::before{display:none!important;}
          .tp-popup-light .leaflet-popup-content-wrapper{
            background:white!important;border:1px solid #e2e8f0!important;border-radius:14px!important;
            color:#111827!important;box-shadow:0 20px 60px rgba(0,0,0,0.2)!important;padding:4px!important;
          }
          .tp-popup-light .leaflet-popup-content{margin:10px 12px!important;}
          .tp-popup-light .leaflet-popup-tip-container{display:none!important;}
          .leaflet-container{background:#f8fafc!important;font-family:system-ui,sans-serif!important;}
          .leaflet-control-zoom a{background:white!important;color:#374151!important;border-color:#e2e8f0!important;box-shadow:0 2px 6px rgba(0,0,0,0.1)!important;}
          .leaflet-control-zoom a:hover{background:#f1f5f9!important;}
          .leaflet-control-layers{background:white!important;border:1px solid #e2e8f0!important;border-radius:10px!important;color:#374151!important;box-shadow:0 4px 16px rgba(0,0,0,0.1)!important;font-size:12px!important;}
          .leaflet-control-layers label{color:#374151!important;}
          .leaflet-control-attribution{background:rgba(255,255,255,0.8)!important;color:#9ca3af!important;font-size:9px!important;}
          .leaflet-control-attribution a{color:#2563eb!important;}
        `}</style>
      </div>

      {/* Zone info pills */}
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(ZONES).map(([key, zone]) => (
            <div key={key} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border"
              style={{ borderColor: zone.color + "44", background: zone.color + "11", color: zone.color }}>
              <div className="w-2 h-2 rounded-full" style={{ background: zone.color }}/>
              <span className="font-bold">{zone.label}</span>
              <span className="opacity-60">({zone.keys.length} locations)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampusMap;

import React, { useEffect, useRef } from "react";
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
  "Main University Gate":          [9.4282, 42.0372],
  "University Stadium":            [9.4290, 42.0318],
  "University Academy":            [9.4285, 42.0328],
  "Administration Building":       [9.4270, 42.0355],
  "Main Library":                  [9.4265, 42.0368],
  "Research Farm 1":               [9.4245, 42.0325],
  "Research Farm 2":               [9.4245, 42.0395],
  "College of Agriculture":        [9.4255, 42.0340],
  "Student Cafeteria":             [9.4260, 42.0362],
  "Dormitory Area":                [9.4275, 42.0342],
  "Health Center":                 [9.4260, 42.0378],
  "Old Institute of Technology":   [9.4218, 42.0380],
  "Veterinary Faculty":            [9.4230, 42.0345],
  "College of Computing":          [9.4250, 42.0362],
  "Post Office":                   [9.4278, 42.0365],
  "Parking Area":                  [9.4280, 42.0358],
  "Sumeya Mosque":                 [9.4182, 42.0355],
  "Haramaya Lake":                 [9.4150, 42.0420],
};

const CampusMap = ({
  selectedLocation,
  onLocationSelect,
  items = [],
  height = "400px",
  readOnly = false,
}) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    if (leafletMapRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: HARAMAYA_CENTER,
      zoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Light Google Maps-style tile (Positron)
    const lightLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap © CARTO", subdomains: "abcd", maxZoom: 20 }
    );

    // Satellite layer
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri", maxZoom: 20 }
    );

    lightLayer.addTo(map);
    L.control.layers(
      { "🗺️ Map": lightLayer, "🛰️ Satellite": satelliteLayer },
      {},
      { position: "topright" }
    ).addTo(map);

    // Campus outline circle
    L.circle([9.4240, 42.0360], {
      color: "#2563eb",
      fillColor: "#2563eb",
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: "6 4",
      radius: 900,
    }).addTo(map).bindTooltip("Haramaya University Campus", { permanent: false });

    // Landmark markers
    Object.entries(CAMPUS_LOCATIONS).forEach(([name, coords]) => {
      const isSelected = selectedLocation === name;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          display:flex;flex-direction:column;align-items:center;
        ">
          <div style="
            width:${isSelected ? 18 : 11}px;
            height:${isSelected ? 18 : 11}px;
            background:${isSelected ? "#2563eb" : "#1e40af"};
            border:2.5px solid ${isSelected ? "white" : "rgba(255,255,255,0.9)"};
            border-radius:50%;
            box-shadow:${isSelected
              ? "0 0 0 3px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.3)"
              : "0 2px 6px rgba(0,0,0,0.25)"};
          "></div>
          ${isSelected ? `
            <div style="
              margin-top:4px;
              background:white;
              color:#1e40af;
              font-size:9px;
              font-weight:800;
              padding:3px 8px;
              border-radius:6px;
              border:1px solid #bfdbfe;
              white-space:nowrap;
              max-width:120px;
              text-align:center;
              overflow:hidden;
              text-overflow:ellipsis;
              box-shadow:0 2px 8px rgba(0,0,0,0.15);
            ">${name}</div>` : ""}
        </div>`,
        iconSize: [isSelected ? 130 : 11, isSelected ? 44 : 11],
        iconAnchor: [isSelected ? 65 : 5, isSelected ? 9 : 5],
      });

      const marker = L.marker(coords, { icon }).addTo(map)
        .bindTooltip(`📍 ${name}`, {
          direction: "top",
          className: "tp-tooltip-light",
          offset: [0, -10],
        });

      if (!readOnly && onLocationSelect) {
        marker.on("click", () => onLocationSelect(name));
      }
    });

    // Item markers
    const offsets = {};
    items.forEach((item) => {
      const coords = CAMPUS_LOCATIONS[item.location];
      if (!coords) return;
      const key = item.location;
      offsets[key] = (offsets[key] || 0) + 1;
      const off = offsets[key] * 0.00006;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:13px;height:13px;
          background:${item.type === "lost" ? "#ef4444" : "#10b981"};
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [13, 13], iconAnchor: [6, 6],
      });

      L.marker([coords[0] + off, coords[1] + off], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px;font-family:system-ui,sans-serif">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="
                font-size:10px;font-weight:800;
                color:${item.type === "lost" ? "#dc2626" : "#059669"};
                background:${item.type === "lost" ? "#fee2e2" : "#d1fae5"};
                padding:2px 8px;border-radius:20px
              ">${item.type.toUpperCase()}</span>
              <span style="font-size:10px;color:#6b7280;text-transform:capitalize">${item.status}</span>
            </div>
            <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:#111827">${item.title}</p>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px">📂 ${item.category}</p>
            <p style="font-size:11px;color:#6b7280;margin:0">📍 ${item.location}</p>
          </div>`, { className: "tp-popup-light" });
    });

    leafletMapRef.current = map;
    return () => { map.remove(); leafletMapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !selectedLocation) return;
    const coords = CAMPUS_LOCATIONS[selectedLocation];
    if (coords) leafletMapRef.current.flyTo(coords, 18, { duration: 1 });
  }, [selectedLocation]);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      <style>{`
        .tp-tooltip-light {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          color: #1e293b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          border-radius: 8px !important;
          padding: 4px 10px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .tp-tooltip-light::before { display:none !important; }
        .tp-popup-light .leaflet-popup-content-wrapper {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 14px !important;
          color: #111827 !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
          padding: 4px !important;
        }
        .tp-popup-light .leaflet-popup-content { margin: 10px 12px !important; }
        .tp-popup-light .leaflet-popup-tip-container { display:none !important; }
        .leaflet-container { background: #f8fafc !important; font-family: system-ui,sans-serif !important; }
        .leaflet-control-zoom a {
          background: white !important;
          color: #374151 !important;
          border-color: #e2e8f0 !important;
          font-size: 16px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a:hover { background: #f1f5f9 !important; color: #111827 !important; }
        .leaflet-control-layers {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          color: #374151 !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
          font-size: 12px !important;
        }
        .leaflet-control-layers label { color: #374151 !important; }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.8) !important;
          color: #9ca3af !important;
          font-size: 9px !important;
          border-radius: 4px 0 0 0 !important;
        }
        .leaflet-control-attribution a { color: #2563eb !important; }
      `}</style>
    </div>
  );
};

export default CampusMap;

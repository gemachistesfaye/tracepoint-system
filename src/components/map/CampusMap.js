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

export const HARAMAYA_CENTER = [9.2167, 42.0347];

export const CAMPUS_LOCATIONS = {
  "Main Library":            [9.2178, 42.0341],
  "Science Block":           [9.2182, 42.0328],
  "Engineering Block":       [9.2170, 42.0320],
  "Agriculture Block":       [9.2158, 42.0352],
  "Student Cafeteria":       [9.2153, 42.0338],
  "Administration Building": [9.2188, 42.0333],
  "Sports Complex":          [9.2138, 42.0348],
  "Dormitory Area":          [9.2143, 42.0318],
  "Main Gate":               [9.2195, 42.0362],
  "Parking Area":            [9.2192, 42.0358],
  "Medical Faculty":         [9.2174, 42.0310],
  "Veterinary Faculty":      [9.2156, 42.0307],
  "College of Computing":    [9.2165, 42.0335],
  "Student Union":           [9.2160, 42.0342],
  "Health Center":           [9.2150, 42.0355],
  "Post Office":             [9.2190, 42.0345],
  "Haramaya Lake":           [9.2120, 42.0380],
  "Research Station":        [9.2130, 42.0295],
};

// Category icon colors
const CATEGORY_ICONS = {
  lost: "#ef4444",
  found: "#10b981",
  selected: "#3b82f6",
  landmark: "#64748b",
};

const CampusMap = ({
  selectedLocation,
  onLocationSelect,
  items = [],
  height = "400px",
  readOnly = false,
  showSatellite = false,
}) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (leafletMapRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: HARAMAYA_CENTER,
      zoom: 16,
      zoomControl: false,
    });

    // Add zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Base layers
    const streetLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap © CARTO", subdomains: "abcd", maxZoom: 20 }
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri", maxZoom: 20 }
    );

    const labelsLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 20, pane: "overlayPane" }
    );

    // Layer control
    const baseMaps = { "🗺️ Street": streetLayer, "🛰️ Satellite": satelliteLayer };
    streetLayer.addTo(map);
    L.control.layers(baseMaps, {}, { position: "topright" }).addTo(map);

    // Campus boundary circle
    L.circle(HARAMAYA_CENTER, {
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.04,
      weight: 1,
      dashArray: "6 4",
      radius: 600,
    }).addTo(map).bindTooltip("Haramaya University Campus", { permanent: false });

    // Landmark markers
    Object.entries(CAMPUS_LOCATIONS).forEach(([name, coords]) => {
      const isSelected = selectedLocation === name;

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            position:relative;
            display:flex;
            flex-direction:column;
            align-items:center;
          ">
            <div style="
              width:${isSelected ? 16 : 10}px;
              height:${isSelected ? 16 : 10}px;
              background:${isSelected ? "#3b82f6" : "#475569"};
              border:2px solid ${isSelected ? "#93c5fd" : "#64748b"};
              border-radius:50%;
              box-shadow:${isSelected ? "0 0 12px rgba(59,130,246,0.8), 0 0 24px rgba(59,130,246,0.4)" : "0 1px 4px rgba(0,0,0,0.5)"};
              transition:all 0.3s;
            "></div>
            ${isSelected ? `<div style="
              margin-top:3px;
              background:#0f1629;
              color:#93c5fd;
              font-size:9px;
              font-weight:700;
              padding:2px 6px;
              border-radius:4px;
              border:1px solid rgba(59,130,246,0.3);
              white-space:nowrap;
              max-width:100px;
              text-align:center;
              overflow:hidden;
              text-overflow:ellipsis;
            ">${name}</div>` : ""}
          </div>`,
        iconSize: [isSelected ? 100 : 10, isSelected ? 40 : 10],
        iconAnchor: [isSelected ? 50 : 5, isSelected ? 8 : 5],
      });

      const marker = L.marker(coords, { icon }).addTo(map)
        .bindTooltip(`📍 ${name}`, {
          direction: "top",
          className: "tp-tooltip",
          offset: [0, -8],
        });

      if (!readOnly && onLocationSelect) {
        marker.on("click", () => onLocationSelect(name));
        marker.getElement()?.style.setProperty("cursor", "pointer");
      }
    });

    // Item markers with clusters feel
    const itemGroups = {};
    items.forEach((item) => {
      const coords = CAMPUS_LOCATIONS[item.location];
      if (!coords) return;

      // Offset slightly to avoid overlap
      const key = item.location;
      if (!itemGroups[key]) itemGroups[key] = 0;
      itemGroups[key]++;
      const offset = itemGroups[key] * 0.00005;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px; height:12px;
          background:${item.type === "lost" ? "#ef4444" : "#10b981"};
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      L.marker([coords[0] + offset, coords[1] + offset], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:10px;font-weight:800;color:${item.type === "lost" ? "#ef4444" : "#10b981"};background:${item.type === "lost" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"};padding:2px 8px;border-radius:20px">${item.type.toUpperCase()}</span>
              <span style="font-size:10px;color:#64748b">${item.status}</span>
            </div>
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${item.title}</p>
            <p style="font-size:11px;color:#94a3b8;margin:0 0 2px">📂 ${item.category}</p>
            <p style="font-size:11px;color:#94a3b8;margin:0">📍 ${item.location}</p>
          </div>`, {
          className: "tp-popup",
        });
    });

    leafletMapRef.current = map;
    layerRef.current = streetLayer;

    return () => { map.remove(); leafletMapRef.current = null; };
  }, []);

  // Fly to selected location
  useEffect(() => {
    if (!leafletMapRef.current || !selectedLocation) return;
    const coords = CAMPUS_LOCATIONS[selectedLocation];
    if (coords) leafletMapRef.current.flyTo(coords, 18, { duration: 1 });
  }, [selectedLocation]);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-white/10 relative">
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      <style>{`
        .tp-tooltip {
          background: #0f1629 !important;
          border: 1px solid rgba(59,130,246,0.3) !important;
          color: white !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 4px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .tp-tooltip::before { display: none !important; }
        .tp-popup .leaflet-popup-content-wrapper {
          background: #0f1629 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 14px !important;
          color: white !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6) !important;
          padding: 4px !important;
        }
        .tp-popup .leaflet-popup-content { margin: 10px 12px !important; }
        .tp-popup .leaflet-popup-tip-container { display: none !important; }
        .leaflet-container { background: #0a0f1e !important; font-family: inherit !important; }
        .leaflet-control-zoom a {
          background: #0f1629 !important;
          color: white !important;
          border-color: rgba(255,255,255,0.1) !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover { background: #1e293b !important; }
        .leaflet-control-layers {
          background: #0f1629 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          color: white !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-layers label { color: #cbd5e1 !important; font-size: 12px !important; }
        .leaflet-control-layers-toggle { background-color: #0f1629 !important; }
        .leaflet-control-attribution {
          background: rgba(10,15,30,0.8) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #3b82f6 !important; }
      `}</style>
    </div>
  );
};

export default CampusMap;

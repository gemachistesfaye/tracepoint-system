import React, { useEffect, useRef } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const HARAMAYA_CENTER = [9.2167, 42.0333];

export const CAMPUS_LOCATIONS = {
  "Main Library": [9.2175, 42.0340],
  "Science Block": [9.2180, 42.0325],
  "Engineering Block": [9.2168, 42.0318],
  "Agriculture Block": [9.2160, 42.0350],
  "Student Cafeteria": [9.2155, 42.0335],
  "Administration Building": [9.2185, 42.0330],
  "Sports Complex": [9.2140, 42.0345],
  "Dormitory Area": [9.2145, 42.0315],
  "Main Gate": [9.2190, 42.0360],
  "Parking Area": [9.2188, 42.0355],
  "Medical Faculty": [9.2172, 42.0308],
  "Veterinary Faculty": [9.2158, 42.0305],
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
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    // Landmark markers
    Object.entries(CAMPUS_LOCATIONS).forEach(([name, coords]) => {
      const isSelected = selectedLocation === name;
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:${isSelected ? 14 : 9}px;height:${isSelected ? 14 : 9}px;
          background:${isSelected ? "#3b82f6" : "#475569"};
          border:2px solid ${isSelected ? "#93c5fd" : "#64748b"};
          border-radius:50%;
          box-shadow:${isSelected ? "0 0 8px #3b82f6" : "none"};
        "></div>`,
        iconSize: [isSelected ? 14 : 9, isSelected ? 14 : 9],
        iconAnchor: [isSelected ? 7 : 4, isSelected ? 7 : 4],
      });

      const marker = L.marker(coords, { icon }).addTo(map)
        .bindTooltip(name, { direction: "top", className: "tp-tooltip" });

      if (!readOnly && onLocationSelect) {
        marker.on("click", () => onLocationSelect(name));
      }
    });

    // Item markers
    items.forEach((item) => {
      const coords = CAMPUS_LOCATIONS[item.location];
      if (!coords) return;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:10px;height:10px;background:${item.type === "lost" ? "#ef4444" : "#10b981"};border:2px solid white;border-radius:50%;"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5],
      });
      L.marker(coords, { icon }).addTo(map)
        .bindPopup(`<div style="font-size:12px;min-width:130px;background:#0f1629;color:white;padding:8px;border-radius:8px">
          <strong>${item.title}</strong><br/>
          <span style="color:${item.type === "lost" ? "#ef4444" : "#10b981"}">${item.type.toUpperCase()}</span> · ${item.category}
        </div>`);
    });

    leafletMapRef.current = map;
    return () => { map.remove(); leafletMapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !selectedLocation) return;
    const coords = CAMPUS_LOCATIONS[selectedLocation];
    if (coords) leafletMapRef.current.flyTo(coords, 17, { duration: 0.8 });
  }, [selectedLocation]);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-white/10 relative">
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      <style>{`
        .tp-tooltip { background:#0f1629!important;border:1px solid rgba(255,255,255,0.1)!important;color:white!important;font-size:11px!important;border-radius:6px!important;padding:4px 8px!important; }
        .leaflet-popup-content-wrapper { background:#0f1629!important;border:1px solid rgba(255,255,255,0.1)!important;border-radius:12px!important;color:white!important;box-shadow:0 20px 60px rgba(0,0,0,0.5)!important; }
        .leaflet-popup-tip { background:#0f1629!important; }
        .leaflet-container { background:#0a0f1e!important; }
        .leaflet-control-zoom a { background:#0f1629!important;color:white!important;border-color:rgba(255,255,255,0.1)!important; }
      `}</style>
    </div>
  );
};

export default CampusMap;

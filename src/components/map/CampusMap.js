import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search, MapPin, ChevronRight,
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAMPUS LOCATIONS (real GPS coordinates for Haramaya University)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HARAMAYA_CENTER = [9.4233, 42.0372];

export const CAMPUS_LOCATIONS = {
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
  "HIT Main Building":             [9.4218, 42.0380],
  "HIT Library":                   [9.4222, 42.0375],
  "HIT Laboratory":                [9.4214, 42.0388],
  "HIT Cafeteria":                 [9.4225, 42.0368],
  "HIT Dormitory":                 [9.4210, 42.0395],
  "HIT Gate":                      [9.4208, 42.0372],
  "Veterinary Faculty":            [9.4230, 42.0345],
  "Veterinary Clinic":             [9.4225, 42.0338],
  "Veterinary Laboratory":         [9.4235, 42.0332],
  "Veterinary Dormitory":          [9.4220, 42.0328],
  "Veterinary Gate":               [9.4240, 42.0322],
};

const BUILDING_CATEGORIES = {
  academic: { color: "#2563EB", label: "Academic" },
  admin:    { color: "#7C3AED", label: "Administration" },
  student:  { color: "#EA580C", label: "Student Life" },
  service:  { color: "#0891B2", label: "Services" },
  sports:   { color: "#DC2626", label: "Sports" },
  research: { color: "#16A34A", label: "Research" },
  religious:{ color: "#9333EA", label: "Religious" },
  nature:   { color: "#059669", label: "Nature" },
  gate:     { color: "#475569", label: "Gate" },
  housing:  { color: "#D97706", label: "Housing" },
};

const BUILDINGS = [
  { name: "Main University Gate", category: "gate" },
  { name: "Administration Building", category: "admin" },
  { name: "Main Library", category: "academic" },
  { name: "Student Cafeteria", category: "student" },
  { name: "College of Computing", category: "academic" },
  { name: "College of Agriculture", category: "academic" },
  { name: "Health Center", category: "service" },
  { name: "Post Office", category: "service" },
  { name: "Parking Area", category: "service" },
  { name: "Dormitory Area", category: "housing" },
  { name: "University Stadium", category: "sports" },
  { name: "University Academy", category: "academic" },
  { name: "Research Farm 1", category: "research" },
  { name: "Research Farm 2", category: "research" },
  { name: "Sumeya Mosque", category: "religious" },
  { name: "Haramaya Lake", category: "nature" },
  { name: "HIT Main Building", category: "academic" },
  { name: "HIT Library", category: "academic" },
  { name: "HIT Laboratory", category: "academic" },
  { name: "HIT Cafeteria", category: "student" },
  { name: "HIT Dormitory", category: "housing" },
  { name: "HIT Gate", category: "gate" },
  { name: "Veterinary Faculty", category: "academic" },
  { name: "Veterinary Clinic", category: "service" },
  { name: "Veterinary Laboratory", category: "academic" },
  { name: "Veterinary Dormitory", category: "housing" },
  { name: "Veterinary Gate", category: "gate" },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM MARKER ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const createIcon = (color, size = 28) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "><div style="
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      transform: rotate(45deg);
      font-size: ${size * 0.4}px;
      color: white; font-weight: bold;
    "></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
};

const lostIcon = createIcon("#EF4444", 30);
const foundIcon = createIcon("#10B981", 30);
const selectedIcon = createIcon("#3B82F6", 34);
const buildingIcon = createIcon("#6B7280", 20);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP CLICK HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        const { lat, lng } = e.latlng;
        let closestBuilding = null;
        let minDist = Infinity;
        for (const [name, coords] of Object.entries(CAMPUS_LOCATIONS)) {
          const dist = Math.sqrt(Math.pow(lat - coords[0], 2) + Math.pow(lng - coords[1], 2));
          if (dist < minDist) { minDist = dist; closestBuilding = name; }
        }
        if (minDist < 0.005) {
          onLocationSelect(closestBuilding);
        }
      }
    },
  });
  return null;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CAMPUS MAP COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CampusMap = ({
  items = [],
  selectedLocation,
  onLocationSelect,
  readOnly = false,
  height = "400px",
  showFilter = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showBuildings, setShowBuildings] = useState(true);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeFilter === "lost") result = result.filter(i => i.type === "lost");
    else if (activeFilter === "found") result = result.filter(i => i.type === "found");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.location?.toLowerCase().includes(q) || i.title?.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeFilter, searchQuery]);

  const filteredBuildings = useMemo(() => {
    if (!searchQuery) return BUILDINGS;
    const q = searchQuery.toLowerCase();
    return BUILDINGS.filter(b => b.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const center = useMemo(() => {
    if (selectedLocation && CAMPUS_LOCATIONS[selectedLocation]) {
      return CAMPUS_LOCATIONS[selectedLocation];
    }
    return HARAMAYA_CENTER;
  }, [selectedLocation]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ height }}>
      {/* Search & Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buildings or items..."
            className="w-full pl-9 pr-3 py-2 bg-white/95 backdrop-blur border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
        </div>
        {showFilter && (
          <div className="flex gap-1 bg-white/95 backdrop-blur border border-gray-200 rounded-xl p-1 shadow-sm">
            {[
              { key: "all", label: "All" },
              { key: "lost", label: "Lost" },
              { key: "found", label: "Found" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === f.key
                    ? f.key === "lost" ? "bg-red-500 text-white"
                    : f.key === "found" ? "bg-emerald-500 text-white"
                    : "bg-primary-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            Lost
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            Found
          </span>
          {showBuildings && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-white shadow-sm" />
              Buildings
            </span>
          )}
        </div>
      </div>

      {/* Toggle Buildings */}
      <button
        onClick={() => setShowBuildings(!showBuildings)}
        className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur border border-gray-200 rounded-xl p-2 shadow-sm hover:bg-gray-50 transition-colors"
        title={showBuildings ? "Hide buildings" : "Show buildings"}
      >
        <MapPin size={16} className={showBuildings ? "text-primary-500" : "text-gray-400"} />
      </button>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!readOnly && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {/* Building Markers */}
        {showBuildings && filteredBuildings.map((building) => {
          const coords = CAMPUS_LOCATIONS[building.name];
          if (!coords) return null;
          const cat = BUILDING_CATEGORIES[building.category] || { color: "#6B7280" };
          return (
            <Marker
              key={building.name}
              position={coords}
              icon={buildingIcon}
            >
              <Popup>
                <div className="text-center p-1">
                  <p className="font-bold text-gray-900 text-sm">{building.name}</p>
                  <p className="text-xs text-gray-500" style={{ color: cat.color }}>{cat.label}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Item Markers */}
        {filteredItems.map((item) => {
          const coords = CAMPUS_LOCATIONS[item.location];
          if (!coords) return null;
          const isSelected = selectedLocation === item.location;
          return (
            <Marker
              key={item.id}
              position={coords}
              icon={isSelected ? selectedIcon : item.type === "lost" ? lostIcon : foundIcon}
            >
              <Popup>
                <div className="p-1 min-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      item.type === "lost" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.location}</p>
                  {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                  <a
                    href={`/items/${item.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details <ChevronRight size={12} />
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CampusMap;

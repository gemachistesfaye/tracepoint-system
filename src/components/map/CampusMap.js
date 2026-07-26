import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Search, ZoomIn, ZoomOut, Maximize2, MapPin, X, ChevronRight,
} from "lucide-react";

// ── CAMPUS LOCATIONS (geographic coordinates) ────────────────────────────────
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

// ── BUILDING DATA (SVG layout, shapes, categories) ──────────────────────────
// Coordinate system: SVG viewBox 0 0 1000 700
// Buildings are placed to approximate the real campus layout

const BUILDING_CATEGORIES = {
  academic: { color: "#2563EB", bg: "#EFF6FF", label: "Academic" },
  admin:    { color: "#7C3AED", bg: "#F5F3FF", label: "Administration" },
  student:  { color: "#EA580C", bg: "#FFF7ED", label: "Student Life" },
  service:  { color: "#0891B2", bg: "#ECFEFF", label: "Services" },
  sports:   { color: "#DC2626", bg: "#FEF2F2", label: "Sports" },
  research: { color: "#16A34A", bg: "#F0FDF4", label: "Research" },
  religious:{ color: "#9333EA", bg: "#FAF5FF", label: "Religious" },
  nature:   { color: "#059669", bg: "#ECFDF5", label: "Nature" },
  gate:     { color: "#475569", bg: "#F1F5F9", label: "Gate" },
  housing:  { color: "#D97706", bg: "#FFFBEB", label: "Housing" },
};

const BUILDINGS = [
  // ── MAIN CAMPUS ──────────────────────────────────────────────────────
  { id: "main-gate", name: "Main University Gate", location: "Main University Gate",
    x: 560, y: 100, w: 60, h: 24, category: "gate", shape: "rect", rotation: 0 },
  { id: "admin", name: "Administration Building", location: "Administration Building",
    x: 460, y: 200, w: 80, h: 50, category: "admin", shape: "rect", rotation: 0 },
  { id: "library", name: "Main Library", location: "Main Library",
    x: 380, y: 140, w: 70, h: 45, category: "academic", shape: "rect", rotation: -5 },
  { id: "cafeteria", name: "Student Cafeteria", location: "Student Cafeteria",
    x: 340, y: 200, w: 55, h: 40, category: "student", shape: "rect", rotation: 0 },
  { id: "computing", name: "College of Computing", location: "College of Computing",
    x: 260, y: 195, w: 65, h: 50, category: "academic", shape: "rect", rotation: 0 },
  { id: "agriculture", name: "College of Agriculture", location: "College of Agriculture",
    x: 300, y: 330, w: 75, h: 45, category: "academic", shape: "rect", rotation: 5 },
  { id: "health", name: "Health Center", location: "Health Center",
    x: 440, y: 100, w: 50, h: 35, category: "service", shape: "rect", rotation: 0 },
  { id: "post-office", name: "Post Office", location: "Post Office",
    x: 530, y: 160, w: 40, h: 30, category: "service", shape: "rect", rotation: 0 },
  { id: "parking", name: "Parking Area", location: "Parking Area",
    x: 520, y: 230, w: 70, h: 45, category: "service", shape: "rect", rotation: 0 },
  { id: "dormitory", name: "Dormitory Area", location: "Dormitory Area",
    x: 470, y: 310, w: 85, h: 55, category: "housing", shape: "rect", rotation: 0 },
  { id: "stadium", name: "University Stadium", location: "University Stadium",
    x: 580, y: 430, w: 90, h: 60, category: "sports", shape: "ellipse", rotation: 0 },
  { id: "academy", name: "University Academy", location: "University Academy",
    x: 550, y: 370, w: 60, h: 40, category: "academic", shape: "rect", rotation: 0 },
  { id: "farm1", name: "Research Farm 1", location: "Research Farm 1",
    x: 250, y: 420, w: 80, h: 50, category: "research", shape: "rect", rotation: 0 },
  { id: "farm2", name: "Research Farm 2", location: "Research Farm 2",
    x: 250, y: 60, w: 80, h: 50, category: "research", shape: "rect", rotation: 0 },
  { id: "mosque", name: "Sumeya Mosque", location: "Sumeya Mosque",
    x: 80, y: 200, w: 50, h: 40, category: "religious", shape: "rect", rotation: 0 },
  { id: "lake", name: "Haramaya Lake", location: "Haramaya Lake",
    x: 40, y: 30, w: 120, h: 80, category: "nature", shape: "ellipse", rotation: 0 },

  // ── HIT CAMPUS ───────────────────────────────────────────────────────
  { id: "hit-main", name: "HIT Main Building", location: "HIT Main Building",
    x: 140, y: 130, w: 65, h: 45, category: "academic", shape: "rect", rotation: 0 },
  { id: "hit-library", name: "HIT Library", location: "HIT Library",
    x: 160, y: 185, w: 50, h: 35, category: "academic", shape: "rect", rotation: 0 },
  { id: "hit-lab", name: "HIT Laboratory", location: "HIT Laboratory",
    x: 100, y: 90, w: 55, h: 40, category: "academic", shape: "rect", rotation: 0 },
  { id: "hit-cafeteria", name: "HIT Cafeteria", location: "HIT Cafeteria",
    x: 190, y: 230, w: 45, h: 30, category: "student", shape: "rect", rotation: 0 },
  { id: "hit-dormitory", name: "HIT Dormitory", location: "HIT Dormitory",
    x: 80, y: 50, w: 60, h: 35, category: "housing", shape: "rect", rotation: 0 },
  { id: "hit-gate", name: "HIT Gate", location: "HIT Gate",
    x: 100, y: 170, w: 40, h: 22, category: "gate", shape: "rect", rotation: 0 },

  // ── VETERINARY CAMPUS ────────────────────────────────────────────────
  { id: "vet-faculty", name: "Veterinary Faculty", location: "Veterinary Faculty",
    x: 190, y: 360, w: 70, h: 45, category: "academic", shape: "rect", rotation: 0 },
  { id: "vet-clinic", name: "Veterinary Clinic", location: "Veterinary Clinic",
    x: 160, y: 410, w: 50, h: 35, category: "service", shape: "rect", rotation: 0 },
  { id: "vet-lab", name: "Veterinary Laboratory", location: "Veterinary Laboratory",
    x: 220, y: 410, w: 55, h: 35, category: "academic", shape: "rect", rotation: 0 },
  { id: "vet-dormitory", name: "Veterinary Dormitory", location: "Veterinary Dormitory",
    x: 130, y: 455, w: 55, h: 30, category: "housing", shape: "rect", rotation: 0 },
  { id: "vet-gate", name: "Veterinary Gate", location: "Veterinary Gate",
    x: 220, y: 455, w: 40, h: 22, category: "gate", shape: "rect", rotation: 0 },
];

// ── ROADS & PATHS ───────────────────────────────────────────────────────────
const ROADS = [
  // Main horizontal roads
  { points: "40,155 620,155", width: 6, type: "main", label: "University Road" },
  { points: "40,280 620,280", width: 5, type: "main", label: "Campus Drive" },
  { points: "40,400 620,400", width: 5, type: "secondary" },
  { points: "40,500 620,500", width: 4, type: "secondary" },

  // Main vertical roads
  { points: "300,20 300,530", width: 5, type: "main", label: "Main Avenue" },
  { points: "480,20 480,530", width: 5, type: "main" },
  { points: "150,20 150,530", width: 4, type: "secondary" },
  { points: "580,20 580,530", width: 4, type: "secondary" },

  // Walkways (thinner, dashed)
  { points: "340,155 340,200", width: 2, type: "walkway" },
  { points: "420,155 420,200", width: 2, type: "walkway" },
  { points: "300,200 340,200", width: 2, type: "walkway" },
  { points: "460,200 480,200", width: 2, type: "walkway" },
  { points: "300,280 300,330", width: 2, type: "walkway" },
  { points: "480,280 480,310", width: 2, type: "walkway" },
  { points: "150,130 150,170", width: 2, type: "walkway" },
  { points: "150,170 190,170", width: 2, type: "walkway" },
  { points: "190,130 190,185", width: 2, type: "walkway" },
  { points: "190,360 190,410", width: 2, type: "walkway" },
  { points: "160,410 160,455", width: 2, type: "walkway" },
  { points: "220,410 220,455", width: 2, type: "walkway" },
];

// ── GREEN AREAS ─────────────────────────────────────────────────────────────
const GREEN_AREAS = [
  { x: 320, y: 90, w: 100, h: 45, label: "Central Lawn" },
  { x: 400, y: 260, w: 60, h: 30, label: "Garden" },
  { x: 500, y: 380, w: 40, h: 30, label: "Green Space" },
  { x: 100, y: 250, w: 60, h: 40, label: "Trees" },
  { x: 350, y: 450, w: 80, h: 40, label: "Campus Garden" },
  { x: 600, y: 150, w: 50, h: 40, label: "Green Belt" },
  { x: 200, y: 270, w: 40, h: 30, label: "Lawn" },
];

// ── ZONES ───────────────────────────────────────────────────────────────────
const ZONES = {
  main: {
    label: "Main Campus",
    color: "#2E7D32",
    bounds: { x: 230, y: 60, w: 380, h: 430 },
  },
  hit: {
    label: "HIT Campus",
    color: "#7C3AED",
    bounds: { x: 60, y: 30, w: 180, h: 230 },
  },
  vet: {
    label: "Veterinary Campus",
    color: "#059669",
    bounds: { x: 110, y: 340, w: 180, h: 160 },
  },
};

// ── HELPER: geo coords to SVG position ──────────────────────────────────────
const geoToSvg = (lat, lng) => {
  const minLat = 9.4140, maxLat = 9.4300;
  const minLng = 42.0290, maxLng = 42.0440;
  const x = ((lng - minLng) / (maxLng - minLng)) * 920 + 40;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 20;
  return { x, y };
};

// ── COMPONENT ───────────────────────────────────────────────────────────────
const CampusMap = ({
  selectedLocation,
  onLocationSelect,
  items = [],
  height = "400px",
  readOnly = false,
  showFilter = false,
}) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [activeZone, setActiveZone] = useState("all");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Compute item counts per location
  const itemCounts = useMemo(() => {
    const counts = {};
    const filtered = filterType === "all" ? items : items.filter(i => i.type === filterType);
    filtered.forEach(item => {
      if (CAMPUS_LOCATIONS[item.location]) {
        if (!counts[item.location]) counts[item.location] = { lost: 0, found: 0, total: 0 };
        counts[item.location][item.type]++;
        counts[item.location].total++;
      }
    });
    return counts;
  }, [items, filterType]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return BUILDINGS.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.3, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.3, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e) => {
    if (!isPanning || e.touches.length !== 1) return;
    e.preventDefault();
    setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => setIsPanning(false), []);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.5, Math.min(3, z + delta)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Building click
  const handleBuildingClick = (building) => {
    if (readOnly) {
      setSelectedBuilding(building);
      return;
    }
    setSelectedBuilding(building);
    if (onLocationSelect) onLocationSelect(building.location);
  };

  // Search select
  const handleSearchSelect = (building) => {
    setSelectedBuilding(building);
    setSearchQuery("");
    setSearchOpen(false);
    if (onLocationSelect) onLocationSelect(building.location);
    // Center on building
    setZoom(2);
    setPan({ x: -(building.x - 500) * 1.5, y: -(building.y - 275) * 1.5 });
  };

  // Fly to selected location
  useEffect(() => {
    if (!selectedLocation) return;
    const building = BUILDINGS.find(b => b.location === selectedLocation);
    if (building) {
      setSelectedBuilding(building);
      setZoom(2);
      setPan({ x: -(building.x - 500) * 1.5, y: -(building.y - 275) * 1.5 });
    }
  }, [selectedLocation]);

  const lostCount = items.filter(i => i.type === "lost" && i.status !== "resolved").length;
  const foundCount = items.filter(i => i.type === "found" && i.status !== "resolved").length;

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* ── TOOLBAR ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search buildings..."
            className="w-full pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
              <X size={14} />
            </button>
          )}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.map(b => (
                <button key={b.id} onClick={() => handleSearchSelect(b)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: BUILDING_CATEGORIES[b.category]?.bg }}>
                    <MapPin size={12} style={{ color: BUILDING_CATEGORIES[b.category]?.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-400 truncate">{BUILDING_CATEGORIES[b.category]?.label}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          )}
          {searchOpen && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 text-center">
              <p className="text-sm text-gray-400">No buildings found</p>
            </div>
          )}
        </div>

        {/* Type filter */}
        {showFilter && (
          <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-xl">
            {[
              { key: "all", label: `All (${items.filter(i=>i.status!=="resolved").length})` },
              { key: "lost", label: `Lost (${lostCount})` },
              { key: "found", label: `Found (${foundCount})` },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === f.key ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}>{f.label}</button>
            ))}
          </div>
        )}

        {/* Zone filter */}
        {showFilter && (
          <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-xl">
            <button onClick={() => setActiveZone("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeZone==="all"?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700 hover:bg-white"}`}>
              All
            </button>
            {Object.entries(ZONES).map(([key, zone]) => (
              <button key={key} onClick={() => setActiveZone(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeZone===key ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}
                style={activeZone===key ? { background: zone.color } : {}}>
                {zone.label}
              </button>
            ))}
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-sm ml-auto">
          <button onClick={handleZoomOut} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors" title="Zoom out">
            <ZoomOut size={15} />
          </button>
          <span className="text-xs font-bold text-gray-400 px-1 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-xl transition-colors" title="Zoom in">
            <ZoomIn size={15} />
          </button>
          <button onClick={handleReset} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-l border-gray-200 rounded-r-xl transition-colors" title="Reset view">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ── MAP CONTAINER ────────────────────────────────────────────── */}
      <div
        style={{ height }}
        className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative bg-[#F0F4F0]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          viewBox="0 0 1000 550"
          className="w-full h-full select-none"
          style={{
            cursor: isPanning ? "grabbing" : "grab",
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.3s ease",
          }}
        >
          <defs>
            {/* Building shadow filter */}
            <filter id="building-shadow" x="-10%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1" />
            </filter>
            <filter id="building-hover" x="-15%" y="-15%" width="140%" height="150%">
              <feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.18" />
            </filter>
            {/* Grid pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.3" opacity="0.5" />
            </pattern>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width="1000" height="550" fill="#F0F4F0" />
          <rect x="0" y="0" width="1000" height="550" fill="url(#grid)" />

          {/* ── ZONES ──────────────────────────────────────────────── */}
          {showFilter && Object.entries(ZONES).map(([key, zone]) => {
            if (activeZone !== "all" && activeZone !== key) return null;
            const b = zone.bounds;
            return (
              <g key={key}>
                <rect
                  x={b.x} y={b.y} width={b.w} height={b.h}
                  rx="12" ry="12"
                  fill={zone.color + "08"}
                  stroke={zone.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.6"
                />
                <text x={b.x + 8} y={b.y + 16} fontSize="10" fontWeight="700" fill={zone.color} opacity="0.7">
                  {zone.label}
                </text>
              </g>
            );
          })}

          {/* ── ROADS ──────────────────────────────────────────────── */}
          {ROADS.map((road, i) => (
            <g key={i}>
              <polyline
                points={road.points}
                fill="none"
                stroke={road.type === "main" ? "#D1D5DB" : road.type === "secondary" ? "#E5E7EB" : "#E5E7EB"}
                strokeWidth={road.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={road.type === "walkway" ? "4 4" : "none"}
              />
              {/* Road center line for main roads */}
              {road.type === "main" && (
                <polyline
                  points={road.points}
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth="1"
                  strokeDasharray="8 6"
                  opacity="0.7"
                />
              )}
            </g>
          ))}

          {/* ── GREEN AREAS ────────────────────────────────────────── */}
          {GREEN_AREAS.map((area, i) => (
            <g key={i}>
              <rect
                x={area.x} y={area.y} width={area.w} height={area.h}
                rx="8" ry="8"
                fill="#D1FAE5"
                stroke="#A7F3D0"
                strokeWidth="0.5"
                opacity="0.7"
              />
              {/* Tree dots */}
              {[...Array(Math.floor(area.w / 15))].map((_, j) => (
                <circle
                  key={j}
                  cx={area.x + 8 + j * 15}
                  cy={area.y + area.h / 2 + (j % 2 === 0 ? -3 : 3)}
                  r="4"
                  fill="#86EFAC"
                  opacity="0.6"
                />
              ))}
              <text x={area.x + area.w / 2} y={area.y + area.h - 4} textAnchor="middle" fontSize="7" fill="#16A34A" opacity="0.5" fontWeight="600">
                {area.label}
              </text>
            </g>
          ))}

          {/* ── LAKE ────────────────────────────────────────────────── */}
          <ellipse cx="100" cy="70" rx="60" ry="35" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="1" opacity="0.6" />
          <ellipse cx="100" cy="68" rx="45" ry="25" fill="#E0F2FE" opacity="0.4" />
          <text x="100" y="73" textAnchor="middle" fontSize="9" fill="#0284C7" fontWeight="700" opacity="0.6">Haramaya Lake</text>

          {/* ── BUILDINGS ───────────────────────────────────────────── */}
          {BUILDINGS.filter(b => {
            if (activeZone === "all") return true;
            const zone = ZONES[activeZone];
            if (!zone) return true;
            const zb = zone.bounds;
            return b.x >= zb.x && b.x <= zb.x + zb.w && b.y >= zb.y && b.y <= zb.y + zb.h;
          }).map(building => {
            const cat = BUILDING_CATEGORIES[building.category];
            const isSelected = selectedLocation === building.location || selectedBuilding?.id === building.id;
            const isHovered = hoveredBuilding === building.id;
            const counts = itemCounts[building.location];
            const hasItems = counts && counts.total > 0;

            return (
              <g
                key={building.id}
                onClick={() => handleBuildingClick(building)}
                onMouseEnter={() => { setHoveredBuilding(building.id); setTooltipPos({ x: building.x + building.w / 2, y: building.y - 8 }); }}
                onMouseLeave={() => setHoveredBuilding(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Building shape */}
                {building.shape === "ellipse" ? (
                  <ellipse
                    cx={building.x + building.w / 2}
                    cy={building.y + building.h / 2}
                    rx={building.w / 2}
                    ry={building.h / 2}
                    fill={isSelected ? cat.color : cat.bg}
                    stroke={isSelected ? cat.color : "#D1D5DB"}
                    strokeWidth={isSelected ? 2 : 1}
                    filter={isSelected || isHovered ? "url(#building-hover)" : "url(#building-shadow)"}
                    opacity={isSelected ? 1 : 0.9}
                  />
                ) : (
                  <rect
                    x={building.x}
                    y={building.y}
                    width={building.w}
                    height={building.h}
                    rx="4"
                    ry="4"
                    fill={isSelected ? cat.color : cat.bg}
                    stroke={isSelected ? cat.color : isHovered ? cat.color : "#D1D5DB"}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                    filter={isSelected || isHovered ? "url(#building-hover)" : "url(#building-shadow)"
                    }
                    opacity={isSelected ? 1 : 0.9}
                    transform={building.rotation ? `rotate(${building.rotation} ${building.x + building.w/2} ${building.y + building.h/2})` : undefined}
                  />
                )}

                {/* Building icon */}
                <text
                  x={building.x + building.w / 2}
                  y={building.y + building.h / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isSelected ? "12" : "10"}
                  fill={isSelected ? "#FFFFFF" : cat.color}
                  fontWeight="700"
                >
                  {building.category === "gate" ? "\u26A0" :
                   building.category === "nature" ? "\u2600" :
                   building.category === "sports" ? "\u26BD" :
                   building.category === "religious" ? "\u2721" :
                   building.category === "research" ? "\u{1F52C}" :
                   building.category === "service" ? "\u2699" :
                   building.category === "housing" ? "\u{1F3E0}" :
                   building.category === "student" ? "\u{1F37A}" :
                   "\u{1F3EB}"}
                </text>

                {/* Building label */}
                <rect
                  x={building.x + building.w / 2 - Math.min(building.name.length * 3.2, building.w / 2 + 10)}
                  y={building.y + building.h + 4}
                  width={Math.min(building.name.length * 6.4, building.w + 20)}
                  height="14"
                  rx="3"
                  fill="white"
                  stroke={isSelected ? cat.color : "#E5E7EB"}
                  strokeWidth="0.5"
                  opacity="0.95"
                />
                <text
                  x={building.x + building.w / 2}
                  y={building.y + building.h + 13}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight={isSelected ? "800" : "600"}
                  fill={isSelected ? cat.color : "#374151"}
                >
                  {building.name.length > 22 ? building.name.slice(0, 20) + "..." : building.name}
                </text>

                {/* Item count badge */}
                {hasItems && (
                  <g>
                    <circle
                      cx={building.x + building.w - 2}
                      cy={building.y - 2}
                      r="8"
                      fill={counts.lost > counts.found ? "#EF4444" : "#2E7D32"}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={building.x + building.w - 2}
                      y={building.y - 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="7"
                      fontWeight="800"
                      fill="white"
                    >
                      {counts.total}
                    </text>
                  </g>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <rect
                    x={building.x - 4}
                    y={building.y - 4}
                    width={building.w + 8}
                    height={building.h + 8}
                    rx="6"
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="12" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}
              </g>
            );
          })}

          {/* ── ITEM MARKERS (individual items scattered near buildings) ── */}
          {(() => {
            const markers = [];
            const offsets = {};
            const filtered = filterType === "all" ? items : items.filter(i => i.type === filterType);

            filtered.forEach((item, idx) => {
              const loc = CAMPUS_LOCATIONS[item.location];
              if (!loc) return;
              const building = BUILDINGS.find(b => b.location === item.location);
              if (!building) return;

              const key = item.location;
              offsets[key] = (offsets[key] || 0) + 1;
              const ox = (offsets[key] % 5) * 6 - 12;
              const oy = Math.floor(offsets[key] / 5) * 6 - 8;

              const mx = building.x + building.w / 2 + ox;
              const my = building.y + building.h / 2 + oy - 20;

              const color = item.type === "lost" ? "#EF4444" : "#2E7D32";
              const opacity = item.status === "resolved" ? 0.3 : 0.9;

              markers.push(
                <g key={`item-${item.id || idx}`} opacity={opacity} style={{ pointerEvents: "none" }}>
                  <circle cx={mx} cy={my} r="4" fill={color} stroke="white" strokeWidth="1.5" />
                  {item.type === "lost" && (
                    <text x={mx} y={my + 1} textAnchor="middle" fontSize="5" fontWeight="800" fill="white">!</text>
                  )}
                </g>
              );
            });
            return markers;
          })()}

          {/* ── TOOLTIP ──────────────────────────────────────────────── */}
          {hoveredBuilding && (() => {
            const b = BUILDINGS.find(bld => bld.id === hoveredBuilding);
            if (!b) return null;
            const cat = BUILDING_CATEGORIES[b.category];
            const counts = itemCounts[b.location];
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={tooltipPos.x - 80}
                  y={tooltipPos.y - 52}
                  width="160"
                  height="44"
                  rx="8"
                  fill="white"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  filter="url(#building-hover)"
                />
                <text x={tooltipPos.x} y={tooltipPos.y - 36} textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">
                  {b.name}
                </text>
                <text x={tooltipPos.x} y={tooltipPos.y - 22} textAnchor="middle" fontSize="8" fill="#6B7280">
                  {cat.label}{counts ? ` \u00b7 ${counts.total} item${counts.total !== 1 ? "s" : ""}` : ""}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* ── SCALE BAR ──────────────────────────────────────────────── */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2 py-1">
          <div className="w-12 h-0.5 bg-gray-400" />
          <span className="text-[9px] text-gray-500 font-medium">~200m</span>
        </div>

        {/* ── COMPASS ────────────────────────────────────────────────── */}
        <div className="absolute top-3 right-14 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points="8,1 10,7 8,6 6,7" fill="#EF4444" />
            <polygon points="8,15 10,9 8,10 6,9" fill="#9CA3AF" />
          </svg>
        </div>

        {/* ── BUILDING DETAIL POPUP ──────────────────────────────────── */}
        {selectedBuilding && (
          <div className="absolute bottom-3 right-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-10">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: BUILDING_CATEGORIES[selectedBuilding.category]?.bg }}>
                    <MapPin size={14} style={{ color: BUILDING_CATEGORIES[selectedBuilding.category]?.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{selectedBuilding.name}</p>
                    <p className="text-xs text-gray-400">{BUILDING_CATEGORIES[selectedBuilding.category]?.label}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBuilding(null)}
                  className="text-gray-400 hover:text-gray-600 p-0.5">
                  <X size={14} />
                </button>
              </div>

              {itemCounts[selectedBuilding.location] && (
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-red-600">{itemCounts[selectedBuilding.location].lost}</p>
                    <p className="text-[10px] text-red-400 font-medium">Lost</p>
                  </div>
                  <div className="flex-1 bg-primary-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-primary-600">{itemCounts[selectedBuilding.location].found}</p>
                    <p className="text-[10px] text-primary-400 font-medium">Found</p>
                  </div>
                </div>
              )}

              {!readOnly && onLocationSelect && (
                <button onClick={() => onLocationSelect(selectedBuilding.location)}
                  className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                  Select This Location
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── LEGEND ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" /> Lost Item
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: "#2E7D32" }} /> Found Item
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-sm" /> Match
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded bg-primary-50 border border-primary-200" /> Academic
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded bg-purple-50 border border-purple-200" /> Admin
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded bg-orange-50 border border-orange-200" /> Student
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded bg-cyan-50 border border-cyan-200" /> Service
        </span>
      </div>

      {/* ── ZONE PILLS ──────────────────────────────────────────────── */}
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(ZONES).map(([key, zone]) => (
            <div key={key} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border"
              style={{ borderColor: zone.color + "44", background: zone.color + "11", color: zone.color }}>
              <div className="w-2 h-2 rounded-full" style={{ background: zone.color }}/>
              <span className="font-bold">{zone.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampusMap;

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useItems } from "../context/ItemsContext";
import { getAllItems } from "../firebase/firestore";
import { findMatches, matchLabel } from "../utils/matching";
import ItemCard from "../components/items/ItemCard";
import {
  PlusCircle, Search, Zap, ArrowRight, Package,
  FileText, CheckCircle, MapPin, Loader2, TrendingUp,
} from "lucide-react";

const CampusMap = lazy(() => import("../components/map/CampusMap"));

const Dashboard = () => {
  const { userProfile, isAdmin } = useAuth();
  const { items, lostItems, foundItems, loading } = useItems();
  const [aiMatches, setAiMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");
  const [selectedMapLoc, setSelectedMapLoc] = useState(null);
  const [mapItems, setMapItems] = useState([]);

  // AI matching: find top matched pairs
  useEffect(() => {
    if (items.length < 2) { setLoadingMatches(false); return; }
    const pairs = [];
    lostItems.slice(0, 20).forEach(lostItem => {
      const matches = findMatches(lostItem, foundItems, 25, 2);
      matches.forEach(m => pairs.push({ lost: lostItem, found: m.item, score: m.score }));
    });
    const seen = new Set();
    const unique = pairs.filter(p => {
      const key = `${p.lost.id}-${p.found.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => b.score - a.score).slice(0, 4);
    setAiMatches(unique);
    setLoadingMatches(false);
  }, [items]);

  const recentItems = [...items].slice(0, 6);
  const resolved = items.filter(i => i.status === "resolved");
  const open = items.filter(i => i.status === "open");

  const quickStats = [
    { label: "Open Reports", value: open.length, icon: <Package size={16} />, color: "blue" },
    { label: "Lost Items", value: lostItems.length, icon: <Search size={16} />, color: "red" },
    { label: "Found Items", value: foundItems.length, icon: <CheckCircle size={16} />, color: "emerald" },
    { label: "Resolved", value: resolved.length, icon: <TrendingUp size={16} />, color: "purple" },
  ];

  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  const matchColors = { emerald: "text-emerald-400 bg-emerald-500/10", blue: "text-blue-400 bg-blue-500/10", yellow: "text-yellow-400 bg-yellow-500/10", gray: "text-slate-400 bg-white/5" };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back, {userProfile?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening on campus today</p>
        </div>
        <Link to="/report" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 text-sm">
          <PlusCircle size={16} /> Report New Item
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map(s => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${colorMap[s.color]}`}>{s.icon}</div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Match Suggestions */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-purple-500/10 text-purple-400 p-2 rounded-xl"><Zap size={18} /></div>
          <div>
            <h2 className="font-bold text-white">AI-Powered Match Suggestions</h2>
            <p className="text-xs text-slate-400">Items that might belong together based on similarity</p>
          </div>
        </div>

        {loadingMatches ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> Analyzing reports...
          </div>
        ) : aiMatches.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Zap size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No matches yet — add more reports to see AI suggestions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiMatches.map((match, i) => {
              const { label, color } = matchLabel(match.score);
              return (
                <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Link to={`/items/${match.lost.id}`} className="hover:opacity-80 transition-opacity">
                      <p className="text-xs text-red-400 font-bold mb-0.5">LOST</p>
                      <p className="text-sm font-semibold text-white truncate">{match.lost.title}</p>
                      <p className="text-xs text-slate-500 truncate">{match.lost.location}</p>
                    </Link>
                    <Link to={`/items/${match.found.id}`} className="hover:opacity-80 transition-opacity">
                      <p className="text-xs text-emerald-400 font-bold mb-0.5">FOUND</p>
                      <p className="text-sm font-semibold text-white truncate">{match.found.title}</p>
                      <p className="text-xs text-slate-500 truncate">{match.found.location}</p>
                    </Link>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-white">{match.score}%</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchColors[color]}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Campus Map */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl"><MapPin size={18} /></div>
          <div>
            <h2 className="font-bold text-white">Campus Map</h2>
            <p className="text-xs text-slate-400">Item locations across Haramaya University</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" />Lost</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" />Found</span>
          </div>
        </div>
        <Suspense fallback={<div className="h-80 bg-white/5 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-sm">Loading map...</div>}>
          <CampusMap
            selectedLocation={selectedMapLoc}
            onLocationSelect={setSelectedMapLoc}
            items={items}
            height="320px"
            readOnly={false}
          />
        </Suspense>
        {selectedMapLoc && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-slate-400">Selected: <span className="text-white font-semibold">{selectedMapLoc}</span></p>
            <Link to={`/search`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Browse items here <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Campus Feed</h2>
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {["recent", "lost", "found"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}>{t}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === "recent" ? recentItems : activeTab === "lost" ? lostItems.slice(0, 6) : foundItems.slice(0, 6))
              .map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
        <div className="text-center mt-6">
          <Link to="/search" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium">
            View all items <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Admin shortcut */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-blue-600/15 to-purple-600/10 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-blue-400" />
            <div>
              <p className="font-bold text-white text-sm">Admin Access</p>
              <p className="text-xs text-slate-400">View analytics, manage claims & users</p>
            </div>
          </div>
          <Link to="/admin" className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            Open Dashboard <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

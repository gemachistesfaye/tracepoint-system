import React, { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useItems } from "../context/ItemsContext";
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
  const myItems = items.filter(i => i.reportedBy === userProfile?.uid);
  const myResolved = myItems.filter(i => i.status === "resolved");

  const quickStats = [
    { label: "Open Reports", value: open.length, icon: <Package size={16} />, color: "blue" },
    { label: "Lost Items", value: lostItems.length, icon: <Search size={16} />, color: "red" },
    { label: "Found Items", value: foundItems.length, icon: <CheckCircle size={16} />, color: "emerald" },
    { label: "Resolved", value: resolved.length, icon: <TrendingUp size={16} />, color: "purple" },
  ];

  const colorMap = {
    blue: "bg-primary-50 text-primary-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const matchColors = { emerald: "text-emerald-600 bg-emerald-50", blue: "text-primary-600 bg-primary-50", yellow: "text-amber-600 bg-amber-50", gray: "text-gray-500 bg-gray-100" };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Welcome back, {userProfile?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening on campus today</p>
        </div>
        <Link to="/report" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary-600/25 text-sm">
          <PlusCircle size={16} /> Report New Item
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${colorMap[s.color]}`}>{s.icon}</div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* My Activity summary */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 text-primary-600 p-2.5 rounded-xl"><Package size={20} /></div>
          <div>
            <p className="font-bold text-gray-900 text-sm">My Reports: {myItems.length}</p>
            <p className="text-xs text-gray-500">{myResolved.length} resolved · {myItems.length - myResolved.length} active</p>
          </div>
        </div>
        <Link to="/my-items" className="text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-1">
          View My Items <ArrowRight size={12} />
        </Link>
      </div>

      {/* AI Match Suggestions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-purple-50 text-purple-600 p-2 rounded-xl"><Zap size={18} /></div>
          <div>
            <h2 className="font-bold text-gray-900">AI-Powered Match Suggestions</h2>
            <p className="text-xs text-gray-500">Items that might belong together based on similarity</p>
          </div>
        </div>

        {loadingMatches ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> Analyzing reports...
          </div>
        ) : aiMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Zap size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No matches yet — add more reports to see AI suggestions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiMatches.map((match, i) => {
              const { label, color } = matchLabel(match.score);
              return (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Link to={`/items/${match.lost.id}`} className="hover:opacity-80 transition-opacity">
                      <p className="text-xs text-red-500 font-bold mb-0.5">LOST</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{match.lost.title}</p>
                      <p className="text-xs text-gray-400 truncate">{match.lost.location}</p>
                    </Link>
                    <Link to={`/items/${match.found.id}`} className="hover:opacity-80 transition-opacity">
                      <p className="text-xs text-emerald-500 font-bold mb-0.5">FOUND</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{match.found.title}</p>
                      <p className="text-xs text-gray-400 truncate">{match.found.location}</p>
                    </Link>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-gray-900">{match.score}%</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchColors[color]}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Campus Map */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-primary-50 text-primary-600 p-2 rounded-xl"><MapPin size={18} /></div>
          <div>
            <h2 className="font-bold text-gray-900">Campus Map</h2>
            <p className="text-xs text-gray-500">Item locations across Haramaya University</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" />Lost</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" />Found</span>
          </div>
        </div>
        <Suspense fallback={<div className="h-80 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-sm">Loading map...</div>}>
          <CampusMap
            selectedLocation={selectedMapLoc}
            onLocationSelect={setSelectedMapLoc}
            items={items}
            height="340px"
            showFilter
            readOnly={false}
          />
        </Suspense>
        {selectedMapLoc && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">Selected: <span className="text-gray-900 font-semibold">{selectedMapLoc}</span></p>
            <Link to="/search" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Browse items here <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Campus Feed</h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {["recent", "lost", "found"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === t ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}>{t}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === "recent" ? recentItems : activeTab === "lost" ? lostItems.slice(0, 6) : foundItems.slice(0, 6))
              .map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
        <div className="text-center mt-6">
          <Link to="/search" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all items <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Admin shortcut */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-primary-50 border border-purple-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-purple-600" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Admin Access</p>
              <p className="text-xs text-gray-500">View analytics, manage claims & users</p>
            </div>
          </div>
          <Link to="/admin" className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            Open Dashboard <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { useItems } from "../../context/ItemsContext";
import { CATEGORIES, LOCATIONS } from "../../utils/helpers";
import { TrendingUp, MapPin, Tag, CheckCircle } from "lucide-react";

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1629] border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const { items } = useItems();

  const stats = useMemo(() => {
    const lost = items.filter(i => i.type === "lost");
    const found = items.filter(i => i.type === "found");
    const resolved = items.filter(i => i.status === "resolved");
    const rate = items.length ? Math.round((resolved.length / items.length) * 100) : 0;

    // Category breakdown
    const categoryData = CATEGORIES.map(cat => ({
      name: cat.split(" ")[0],
      lost: lost.filter(i => i.category === cat).length,
      found: found.filter(i => i.category === cat).length,
    })).filter(d => d.lost + d.found > 0);

    // Location heatmap data
    const locationData = LOCATIONS.map(loc => ({
      name: loc.split(" ").slice(0, 2).join(" "),
      total: items.filter(i => i.location === loc).length,
      lost: lost.filter(i => i.location === loc).length,
    })).filter(d => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 8);

    // Status pie
    const statusData = [
      { name: "Open", value: items.filter(i => i.status === "open").length, color: "#10b981" },
      { name: "Claimed", value: items.filter(i => i.status === "claimed").length, color: "#f59e0b" },
      { name: "Resolved", value: resolved.length, color: "#3b82f6" },
    ].filter(d => d.value > 0);

    // Timeline (last 7 days)
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString("en", { weekday: "short" });
      const dayItems = items.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return itemDate.toDateString() === d.toDateString();
      });
      return {
        day: dayStr,
        lost: dayItems.filter(i => i.type === "lost").length,
        found: dayItems.filter(i => i.type === "found").length,
      };
    });

    return { lost, found, resolved, rate, categoryData, locationData, statusData, timeline };
  }, [items]);

  const metricCards = [
    { label: "Total Reports", value: items.length, icon: <Tag size={18} />, color: "blue" },
    { label: "Lost Items", value: stats.lost.length, icon: <MapPin size={18} />, color: "red" },
    { label: "Found Items", value: stats.found.length, icon: <CheckCircle size={18} />, color: "emerald" },
    { label: "Recovery Rate", value: `${stats.rate}%`, icon: <TrendingUp size={18} />, color: "purple" },
  ];

  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400", red: "bg-red-500/10 text-red-400",
    emerald: "bg-emerald-500/10 text-emerald-400", purple: "bg-purple-500/10 text-purple-400",
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <TrendingUp size={48} className="mx-auto mb-3 opacity-20" />
        <p className="text-slate-400">No data yet — analytics will appear once items are reported.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(m => (
          <div key={m.label} className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${colorMap[m.color]}`}>{m.icon}</div>
            <p className="text-3xl font-black text-white">{m.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily activity */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">7-Day Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} name="Lost" />
              <Line type="monotone" dataKey="found" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Found" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Item Status Distribution</h3>
          {stats.statusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {stats.statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {stats.statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-slate-400">{s.name}</span>
                    <span className="text-xs font-bold text-white ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {stats.categoryData.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Reports by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.categoryData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Lost" />
              <Bar dataKey="found" fill="#10b981" radius={[4, 4, 0, 0]} name="Found" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Location heatmap */}
      {stats.locationData.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Hot Zones — Top Locations</h3>
          <div className="space-y-2.5">
            {stats.locationData.map((loc, i) => {
              const maxVal = stats.locationData[0]?.total || 1;
              const pct = Math.round((loc.total / maxVal) * 100);
              return (
                <div key={loc.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4 font-bold">{i + 1}</span>
                  <span className="text-xs text-slate-300 w-36 truncate">{loc.name}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
                    }} />
                  </div>
                  <span className="text-xs font-bold text-white w-6 text-right">{loc.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

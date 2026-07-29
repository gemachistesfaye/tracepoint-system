import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area,
} from "recharts";
import { useItems } from "../../context/ItemsContext";
import { CATEGORIES, LOCATIONS } from "../../utils/helpers";
import { TrendingUp, Tag, CheckCircle, Clock, Zap, Award, BarChart3 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 shadow-xl">
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
    const claimed = items.filter(i => i.status === "claimed");
    const rate = items.length ? Math.round((resolved.length / items.length) * 100) : 0;

    const categoryData = CATEGORIES.map(cat => ({
      name: cat.split(" ")[0],
      lost: lost.filter(i => i.category === cat).length,
      found: found.filter(i => i.category === cat).length,
    })).filter(d => d.lost + d.found > 0);

    const locationData = LOCATIONS.map(loc => ({
      name: loc.split(" ").slice(0, 2).join(" "),
      fullName: loc,
      total: items.filter(i => i.location === loc).length,
      lost: lost.filter(i => i.location === loc).length,
      found: found.filter(i => i.location === loc).length,
    })).filter(d => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 10);

    const statusData = [
      { name: "Open", value: items.filter(i => i.status === "open").length, color: "#10b981" },
      { name: "Claimed", value: claimed.length, color: "#f59e0b" },
      { name: "Resolved", value: resolved.length, color: "#2E7D32" },
    ].filter(d => d.value > 0);

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

    // Weekly trend (4 weeks)
    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekItems = items.filter(item => {
        if (!item.createdAt) return false;
        const d = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return d >= weekStart && d < weekEnd;
      });
      return {
        week: `W${4 - i}`,
        lost: weekItems.filter(i => i.type === "lost").length,
        found: weekItems.filter(i => i.type === "found").length,
        resolved: weekItems.filter(i => i.status === "resolved").length,
      };
    }).reverse();

    // Avg resolution time
    const resolvedItems = items.filter(i => i.status === "resolved" && i.createdAt && i.updatedAt);
    let avgResolutionDays = "\u2014";
    if (resolvedItems.length > 0) {
      const avgMs = resolvedItems.reduce((sum, i) => {
        const c = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt);
        const u = i.updatedAt?.toDate ? i.updatedAt.toDate() : new Date(i.updatedAt);
        return sum + (u - c);
      }, 0) / resolvedItems.length;
      const days = avgMs / (1000 * 60 * 60 * 24);
      avgResolutionDays = days < 1 ? "<1 day" : `${Math.round(days)} days`;
    }

    // Most lost category
    const lostByCategory = {};
    lost.forEach(i => { lostByCategory[i.category] = (lostByCategory[i.category] || 0) + 1; });
    const topLostCategory = Object.entries(lostByCategory).sort((a, b) => b[1] - a[1])[0];

    // Peak day
    const dayCounts = {};
    items.forEach(i => {
      if (!i.createdAt) return;
      const d = i.createdAt.toDate ? i.createdAt.toDate() : new Date(i.createdAt);
      const key = d.toLocaleDateString("en", { weekday: "long" });
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });
    const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      lost, found, resolved, claimed, rate, categoryData, locationData, statusData,
      timeline, weeklyTrend, avgResolutionDays, topLostCategory, peakDay,
      totalLost: lost.length, totalFound: found.length,
    };
  }, [items]);

  const metricCards = [
    { label: "Total Reports", value: items.length, icon: <Tag size={18} />, color: "green" },
    { label: "Recovery Rate", value: `${stats.rate}%`, icon: <TrendingUp size={18} />, color: "purple" },
    { label: "Avg Resolution", value: stats.avgResolutionDays, icon: <Clock size={18} />, color: "cyan" },
    { label: "Active Claims", value: stats.claimed.length, icon: <Zap size={18} />, color: "amber" },
  ];

  const insightCards = [
    {
      label: "Most Lost Category",
      value: stats.topLostCategory ? stats.topLostCategory[0] : "\u2014",
      sub: stats.topLostCategory ? `${stats.topLostCategory[1]} reports` : "No data",
      icon: <Award size={18} />,
      color: "red",
    },
    {
      label: "Peak Activity Day",
      value: stats.peakDay ? stats.peakDay[0] : "\u2014",
      sub: stats.peakDay ? `${stats.peakDay[1]} items` : "No data",
      icon: <BarChart3 size={18} />,
      color: "blue",
    },
    {
      label: "Lost vs Found",
      value: stats.totalLost > 0 ? `${Math.round((stats.totalFound / stats.totalLost) * 100)}%` : "\u2014",
      sub: `${stats.totalLost} lost / ${stats.totalFound} found`,
      icon: <Tag size={18} />,
      color: "emerald",
    },
    {
      label: "Items Returned",
      value: stats.resolved.length,
      sub: `of ${items.length} total reports`,
      icon: <CheckCircle size={18} />,
      color: "green",
    },
  ];

  const colorMap = {
    green: "bg-primary-50 text-primary-600", red: "bg-red-50 text-red-500",
    emerald: "bg-emerald-50 text-emerald-600", purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600", amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <TrendingUp size={48} className="mx-auto mb-3 opacity-20" />
        <p className="text-gray-500">No data yet &mdash; analytics will appear once items are reported.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(m => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${colorMap[m.color]}`}>{m.icon}</div>
            <p className="text-3xl font-black text-gray-900">{m.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map(m => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${colorMap[m.color]}`}>{m.icon}</div>
            <p className="text-lg font-black text-gray-900 truncate">{m.value}</p>
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-xs text-gray-400">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">7-Day Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="lostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="foundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="lost" stroke="#ef4444" fill="url(#lostGrad)" strokeWidth={2} name="Lost" />
              <Area type="monotone" dataKey="found" stroke="#10b981" fill="url(#foundGrad)" strokeWidth={2} name="Found" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">4-Week Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.weeklyTrend} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Lost" />
              <Bar dataKey="found" fill="#10b981" radius={[4, 4, 0, 0]} name="Found" />
              <Bar dataKey="resolved" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Item Status Distribution</h3>
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
                    <span className="text-xs text-gray-500">{s.name}</span>
                    <span className="text-xs font-bold text-gray-900 ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        {stats.categoryData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Reports by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.categoryData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Lost" />
                <Bar dataKey="found" fill="#10b981" radius={[4, 4, 0, 0]} name="Found" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {stats.locationData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Hot Zones &mdash; Top Locations</h3>
          <div className="space-y-2.5">
            {stats.locationData.map((loc, i) => {
              const maxVal = stats.locationData[0]?.total || 1;
              const pct = Math.round((loc.total / maxVal) * 100);
              return (
                <div key={loc.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 font-bold">{i + 1}</span>
                  <span className="text-xs text-gray-600 w-36 truncate">{loc.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-400 rounded-l-full" style={{ width: `${loc.total > 0 ? (loc.lost / loc.total) * pct : 0}%` }} />
                    <div className="h-full bg-emerald-400 rounded-r-full" style={{ width: `${loc.total > 0 ? (loc.found / loc.total) * pct : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-6 text-right">{loc.total}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Lost</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Found</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

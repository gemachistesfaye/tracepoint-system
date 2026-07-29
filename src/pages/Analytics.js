import React, { useState, lazy, Suspense } from "react";
import { BarChart3, MapPin, Loader2 } from "lucide-react";

const AnalyticsDashboard = lazy(() => import("../components/analytics/AnalyticsDashboard"));
const HeatMap = lazy(() => import("../components/analytics/HeatMap"));

const Analytics = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl"><BarChart3 size={22} /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Campus lost & found insights</p>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-2xl">
          {[
            { key: "overview", label: "Overview", icon: <BarChart3 size={13} /> },
            { key: "heatmap", label: "Heat Map", icon: <MapPin size={13} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? "bg-primary-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
        {tab === "overview" ? <AnalyticsDashboard /> : <HeatMap />}
      </Suspense>
    </div>
  );
};

export default Analytics;

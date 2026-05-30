import React from "react";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import { BarChart3 } from "lucide-react";

const Analytics = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="bg-purple-500/10 text-purple-400 p-3 rounded-2xl"><BarChart3 size={22} /></div>
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-sm text-slate-400">Campus lost & found insights</p>
      </div>
    </div>
    <AnalyticsDashboard />
  </div>
);

export default Analytics;

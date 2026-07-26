import React, { useState } from "react";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import { BarChart3 } from "lucide-react";

const Analytics = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl"><BarChart3 size={22} /></div>
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Campus lost & found insights</p>
      </div>
    </div>
    <AnalyticsDashboard />
  </div>
);

export default Analytics;

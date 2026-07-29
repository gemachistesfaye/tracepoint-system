import React from "react";

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export const ItemCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" role="status" aria-label="Loading item">
    <Pulse className="h-44 rounded-none rounded-t-2xl" />
    <div className="p-4 space-y-3">
      <Pulse className="h-4 w-3/4" />
      <Pulse className="h-3 w-full" />
      <div className="space-y-2">
        <Pulse className="h-3 w-1/2" />
        <Pulse className="h-3 w-2/3" />
        <Pulse className="h-3 w-1/3" />
      </div>
    </div>
    <span className="sr-only">Loading item card...</span>
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm" role="status" aria-label="Loading stat">
    <Pulse className="h-9 w-9 rounded-xl mb-2" />
    <Pulse className="h-7 w-16 mb-1" />
    <Pulse className="h-3 w-20" />
    <span className="sr-only">Loading stat...</span>
  </div>
);

export const TableRowSkeleton = ({ cols = 6 }) => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
    {Array.from({ length: cols }).map((_, i) => (
      <Pulse key={i} className={`h-4 ${i === 0 ? "w-10" : "flex-1"}`} />
    ))}
    <span className="sr-only">Loading row...</span>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm" role="status" aria-label="Loading table">
    <div className="px-5 py-3.5 border-b border-gray-100">
      <Pulse className="h-4 w-32" />
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
    <span className="sr-only">Loading table data...</span>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" role="status" aria-label="Loading dashboard">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Pulse className="h-8 w-64" />
        <Pulse className="h-4 w-48" />
      </div>
      <Pulse className="h-10 w-36 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
    </div>
    <Pulse className="h-20 rounded-2xl" />
    <Pulse className="h-64 rounded-2xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)}
    </div>
    <span className="sr-only">Loading dashboard...</span>
  </div>
);

export const PageSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-6" role="status" aria-label="Loading page">
    <div className="space-y-2">
      <Pulse className="h-8 w-48" />
      <Pulse className="h-4 w-64" />
    </div>
    <Pulse className="h-16 rounded-2xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <ItemCardSkeleton key={i} />)}
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

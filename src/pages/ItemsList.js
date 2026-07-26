import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/items/ItemCard";
import { CATEGORIES, LOCATIONS, searchItems } from "../utils/helpers";
import { Search, SlidersHorizontal, X } from "lucide-react";

const ItemsList = () => {
  const { type } = useParams();
  const { lostItems, foundItems, loading } = useItems();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const baseItems = type === "lost" ? lostItems : foundItems;
  let filtered = searchItems(baseItems, query);
  if (category) filtered = filtered.filter(i => i.category === category);
  if (location) filtered = filtered.filter(i => i.location === location);
  if (status) filtered = filtered.filter(i => i.status === status);

  const hasFilters = query || category || location || status;
  const selectClass = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className={`w-3 h-3 rounded-full ${type === "lost" ? "bg-red-500" : "bg-emerald-500"}`} />
          <h1 className="text-3xl font-black text-gray-900 capitalize">{type} Items</h1>
        </div>
        <p className="text-gray-500 text-sm">{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${type} items...`}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
              showFilters ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            <SlidersHorizontal size={16} /> Filters
            {hasFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)} className={selectClass}>
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="claimed">Claim Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}
        {hasFilters && (
          <button onClick={() => { setQuery(""); setCategory(""); setLocation(""); setStatus(""); }}
            className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-gray-500">No items found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
};
export default ItemsList;

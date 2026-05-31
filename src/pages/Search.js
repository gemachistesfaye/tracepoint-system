import React, { useState } from "react";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/items/ItemCard";
import { CATEGORIES, LOCATIONS, searchItems } from "../utils/helpers";
import { Search as SearchIcon, X } from "lucide-react";

const Search = () => {
  const { items, loading } = useItems();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  let results = searchItems(items, query);
  if (type) results = results.filter(i => i.type === type);
  if (category) results = results.filter(i => i.category === category);
  if (location) results = results.filter(i => i.location === location);

  const hasFilters = query || type || category || location;
  const selectClass = "bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Search Items</h1>
        <p className="text-slate-400">Search across all lost and found reports on campus</p>
      </div>

      <div className="bg-white/3 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="relative mb-4">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, description, category, location..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={type} onChange={e => setType(e.target.value)} className={selectClass}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={location} onChange={e => setLocation(e.target.value)} className={selectClass}>
            <option value="">All Locations</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={() => { setQuery(""); setType(""); setCategory(""); setLocation(""); }}
            className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <X size={12} /> Clear all filters
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-slate-400 mb-4">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <SearchIcon size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-slate-400">{hasFilters ? "No items match your search" : "Start searching above"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
};
export default Search;

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
  if (type) results = results.filter((i) => i.type === type);
  if (category) results = results.filter((i) => i.category === category);
  if (location) results = results.filter((i) => i.location === location);

  const hasFilters = query || type || category || location;
  const selectClass =
    "border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Items</h1>

      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6 space-y-3">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, category, location..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setQuery(""); setType(""); setCategory(""); setLocation(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
          >
            <X size={12} /> Clear all filters
          </button>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-sm text-gray-500 mb-4">
          {results.length} result{results.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <SearchIcon size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-gray-500">
            {hasFilters ? "No items match your search" : "Start searching above"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
};

export default Search;

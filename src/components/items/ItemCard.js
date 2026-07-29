import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";
import { timeAgo, STATUS_LABELS } from "../../utils/helpers";

const ItemCard = ({ item }) => {
  const isLost = item.type === "lost";
  return (
    <Link to={`/items/${item.id}`}
      className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={`${item.type === "lost" ? "Lost" : "Found"} item: ${item.title}, ${item.category}, ${item.location}`}>
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} loading="lazy" width="380" height="176"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={32} className="text-gray-300" />
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-black px-2.5 py-1 rounded-full ${
          isLost ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        }`}>{isLost ? "LOST" : "FOUND"}</span>
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${
          item.status === "open" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : item.status === "claimed" ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-gray-100 text-gray-500 border border-gray-200"
        }`}>{STATUS_LABELS[item.status]}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Tag size={11} /><span>{item.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={11} /><span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={11} /><span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default ItemCard;

import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";
import { timeAgo, STATUS_LABELS } from "../../utils/helpers";

const ItemCard = ({ item }) => {
  const isLost = item.type === "lost";
  return (
    <Link to={`/items/${item.id}`}
      className="block bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:bg-white/5 transition-all duration-200 group">
      <div className="relative h-44 bg-white/5 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={32} className="text-white/10" />
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-black px-2.5 py-1 rounded-full ${
          isLost ? "bg-red-500/90 text-white" : "bg-emerald-500/90 text-white"
        }`}>{isLost ? "LOST" : "FOUND"}</span>
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${
          item.status === "open" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : item.status === "claimed" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          : "bg-white/10 text-slate-400 border border-white/10"
        }`}>{STATUS_LABELS[item.status]}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white truncate">{item.title}</h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Tag size={11} /><span>{item.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={11} /><span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={11} /><span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default ItemCard;

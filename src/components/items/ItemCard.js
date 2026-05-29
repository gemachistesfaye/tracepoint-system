import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";
import { timeAgo, STATUS_COLORS, STATUS_LABELS } from "../../utils/helpers";

const ItemCard = ({ item }) => {
  const isLost = item.type === "lost";

  return (
    <Link
      to={`/items/${item.id}`}
      className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={32} className="text-gray-300" />
          </div>
        )}
        {/* Type badge */}
        <span
          className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full ${
            isLost
              ? "bg-red-500 text-white"
              : "bg-emerald-500 text-white"
          }`}
        >
          {isLost ? "LOST" : "FOUND"}
        </span>
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}
        >
          {STATUS_LABELS[item.status]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Tag size={12} className="shrink-0" />
            <span>{item.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} className="shrink-0" />
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;

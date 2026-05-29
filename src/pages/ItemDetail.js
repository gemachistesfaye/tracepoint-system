import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getItem, deleteItem, updateItem, addNotification } from "../firebase/firestore";
import { deleteImage } from "../firebase/storage";
import ClaimModal from "../components/claims/ClaimModal";
import { formatDate, timeAgo, STATUS_COLORS, STATUS_LABELS } from "../utils/helpers";
import toast from "react-hot-toast";
import {
  MapPin, Calendar, Tag, Phone, User, ArrowLeft,
  Trash2, CheckCircle, Loader2, AlertCircle,
} from "lucide-react";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    getItem(id).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [id]);

  const isOwner = currentUser?.uid === item?.reportedBy;
  const canClaim =
    currentUser &&
    !isOwner &&
    item?.status === "open";

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    setDeleting(true);
    try {
      if (item.imagePath) await deleteImage(item.imagePath);
      await deleteItem(id);
      toast.success("Item deleted.");
      navigate(-1);
    } catch (err) {
      toast.error("Could not delete item.");
      setDeleting(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await updateItem(id, { status: "resolved" });
      await addNotification(
        item.reportedBy,
        `Your item "${item.title}" has been marked as resolved!`,
        "success"
      );
      setItem((prev) => ({ ...prev, status: "resolved" }));
      toast.success("Item marked as resolved!");
    } catch {
      toast.error("Failed to resolve item.");
    }
    setResolving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20 text-gray-400">
        <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">Item not found.</p>
        <Link to="/" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Image */}
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                item.type === "lost"
                  ? "bg-red-100 text-red-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {item.type === "lost" ? "LOST" : "FOUND"}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <span className="text-xs text-gray-400 ml-auto">{timeAgo(item.createdAt)}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { icon: <Tag size={15} />, label: "Category", value: item.category },
              { icon: <MapPin size={15} />, label: "Location", value: item.location },
              {
                icon: <Calendar size={15} />,
                label: item.type === "lost" ? "Date Lost" : "Date Found",
                value: item.date,
              },
              {
                icon: <Phone size={15} />,
                label: "Contact",
                value: item.reporterContact || "Not provided",
              },
              { icon: <User size={15} />, label: "Reported by", value: item.reporterName },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            {canClaim && (
              <button
                onClick={() => setShowClaim(true)}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <CheckCircle size={16} /> Claim This Item
              </button>
            )}

            {(isOwner || isAdmin) && item.status !== "resolved" && (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Mark Resolved
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-50 text-red-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-100"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            )}

            {!currentUser && (
              <Link
                to="/login"
                className="text-sm text-blue-600 font-medium hover:underline self-center"
              >
                Sign in to claim this item
              </Link>
            )}
          </div>
        </div>
      </div>

      {showClaim && (
        <ClaimModal item={item} onClose={() => setShowClaim(false)} />
      )}
    </div>
  );
};

export default ItemDetail;

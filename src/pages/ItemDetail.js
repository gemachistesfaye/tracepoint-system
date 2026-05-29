import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getItem, deleteItem, updateItem, addNotification } from "../firebase/firestore";
import { deleteImage } from "../firebase/storage";
import ClaimModal from "../components/claims/ClaimModal";
import { formatDate, timeAgo, STATUS_LABELS } from "../utils/helpers";
import toast from "react-hot-toast";
import { MapPin, Calendar, Tag, Phone, User, ArrowLeft, Trash2, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => { getItem(id).then(data => { setItem(data); setLoading(false); }); }, [id]);

  const isOwner = currentUser?.uid === item?.reportedBy;
  const canClaim = currentUser && !isOwner && item?.status === "open";

  const handleDelete = async () => {
    if (!window.confirm("Delete this report?")) return;
    setDeleting(true);
    try {
      if (item.imagePath) await deleteImage(item.imagePath);
      await deleteItem(id);
      toast.success("Item deleted.");
      navigate(-1);
    } catch { toast.error("Could not delete."); setDeleting(false); }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await updateItem(id, { status: "resolved" });
      await addNotification(item.reportedBy, `Your item "${item.title}" has been marked as resolved!`, "success");
      setItem(prev => ({ ...prev, status: "resolved" }));
      toast.success("Marked as resolved!");
    } catch { toast.error("Failed."); }
    setResolving(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;
  if (!item) return (
    <div className="text-center py-20 text-slate-500">
      <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
      <p className="text-lg font-medium text-slate-400">Item not found.</p>
      <Link to="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Back to Home</Link>
    </div>
  );

  const statusStyles = {
    open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    claimed: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    resolved: "bg-white/10 text-slate-400 border-white/10",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white/3 border border-white/10 rounded-3xl overflow-hidden">
        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-72 object-cover opacity-90" />}

        <div className="p-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs font-black px-3 py-1 rounded-full ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
              {item.type.toUpperCase()}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyles[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <span className="text-xs text-slate-500 ml-auto">{timeAgo(item.createdAt)}</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-3">{item.title}</h1>
          <p className="text-slate-400 leading-relaxed mb-8">{item.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              { icon: <Tag size={14} />, label: "Category", value: item.category },
              { icon: <MapPin size={14} />, label: "Location", value: item.location },
              { icon: <Calendar size={14} />, label: item.type === "lost" ? "Date Lost" : "Date Found", value: item.date },
              { icon: <Phone size={14} />, label: "Contact", value: item.reporterContact || "Not provided" },
              { icon: <User size={14} />, label: "Reported by", value: item.reporterName },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-4 bg-white/3 rounded-2xl border border-white/5">
                <span className="text-slate-500 mt-0.5 shrink-0">{icon}</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-6 border-t border-white/8">
            {canClaim && (
              <button onClick={() => setShowClaim(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5">
                <CheckCircle size={16} /> Claim This Item
              </button>
            )}
            {(isOwner || isAdmin) && item.status !== "resolved" && (
              <button onClick={handleResolve} disabled={resolving}
                className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50">
                {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Mark Resolved
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
              </button>
            )}
            {!currentUser && (
              <Link to="/login" className="text-sm text-blue-400 font-medium hover:underline self-center">
                Sign in to claim this item
              </Link>
            )}
          </div>
        </div>
      </div>

      {showClaim && <ClaimModal item={item} onClose={() => setShowClaim(false)} />}
    </div>
  );
};
export default ItemDetail;

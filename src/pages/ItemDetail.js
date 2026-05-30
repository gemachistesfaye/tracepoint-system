import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getItem, deleteItem, updateItem, addNotification, getAllItems } from "../firebase/firestore";
import { deleteImage } from "../firebase/storage";
import ClaimModal from "../components/claims/ClaimModal";
import { formatDate, timeAgo, STATUS_LABELS } from "../utils/helpers";
import { findMatches, matchLabel, findDuplicates } from "../utils/matching";
import toast from "react-hot-toast";
import {
  MapPin, Calendar, Tag, Phone, User, ArrowLeft, Trash2,
  CheckCircle, Loader2, AlertCircle, Zap, Clock, AlertTriangle,
} from "lucide-react";

const CampusMap = lazy(() => import("../components/map/CampusMap"));

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [data, items] = await Promise.all([getItem(id), getAllItems()]);
      setItem(data);
      setAllItems(items);
      if (data) {
        setAiMatches(findMatches(data, items, 25, 3));
        setDuplicates(findDuplicates(data, items, 60));
      }
      setLoading(false);
    };
    load();
  }, [id]);

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
    <div className="text-center py-20">
      <AlertCircle size={48} className="mx-auto mb-3 opacity-20 text-slate-500" />
      <p className="text-slate-400">Item not found.</p>
      <Link to="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Back to Home</Link>
    </div>
  );

  const statusStyles = {
    open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    claimed: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    resolved: "bg-white/10 text-slate-400 border-white/10",
  };

  const matchColors = { emerald: "text-emerald-400 bg-emerald-500/10", blue: "text-blue-400 bg-blue-500/10", yellow: "text-yellow-400 bg-yellow-500/10", gray: "text-slate-400 bg-white/5" };

  // Timeline events
  const timeline = [
    { icon: <PlusIcon />, label: `${item.type === "lost" ? "Lost" : "Found"} item reported`, time: timeAgo(item.createdAt), color: "blue" },
    ...(item.status === "claimed" ? [{ icon: <ClaimIcon />, label: "Ownership claim submitted", time: "Pending review", color: "yellow" }] : []),
    ...(item.status === "resolved" ? [
      { icon: <ClaimIcon />, label: "Claim submitted", time: "", color: "yellow" },
      { icon: <ResolvedIcon />, label: "Item resolved & returned", time: timeAgo(item.updatedAt || item.createdAt), color: "emerald" },
    ] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Duplicate warning */}
          {duplicates.length > 0 && (isOwner || isAdmin) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-yellow-400">Possible Duplicate Detected</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  This report is {duplicates[0].score}% similar to{" "}
                  <Link to={`/items/${duplicates[0].item.id}`} className="text-yellow-400 underline">
                    another {item.type} report
                  </Link>. Please check before submitting.
                </p>
              </div>
            </div>
          )}

          {/* Item card */}
          <div className="bg-white/3 border border-white/10 rounded-3xl overflow-hidden">
            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover opacity-90" />}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {item.type.toUpperCase()}
                </span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyles[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
                <span className="text-xs text-slate-500 ml-auto">{timeAgo(item.createdAt)}</span>
              </div>

              <h1 className="text-2xl font-black text-white mb-3">{item.title}</h1>
              <p className="text-slate-400 leading-relaxed mb-6">{item.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { icon: <Tag size={14} />, label: "Category", value: item.category },
                  { icon: <MapPin size={14} />, label: "Location", value: item.location },
                  { icon: <Calendar size={14} />, label: item.type === "lost" ? "Date Lost" : "Date Found", value: item.date },
                  { icon: <Phone size={14} />, label: "Contact", value: item.reporterContact || "Not provided" },
                  { icon: <User size={14} />, label: "Reported by", value: item.reporterName },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                    <span className="text-slate-500 mt-0.5 shrink-0">{icon}</span>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
                      <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/8">
                {canClaim && (
                  <button onClick={() => setShowClaim(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">
                    <CheckCircle size={16} /> Claim This Item
                  </button>
                )}
                {(isOwner || isAdmin) && item.status !== "resolved" && (
                  <button onClick={handleResolve} disabled={resolving}
                    className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
                    {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Mark Resolved
                  </button>
                )}
                {(isOwner || isAdmin) && (
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                  </button>
                )}
                {!currentUser && (
                  <Link to="/login" className="text-sm text-blue-400 font-medium hover:underline self-center">Sign in to claim</Link>
                )}
              </div>
            </div>
          </div>

          {/* Campus Map */}
          {item.location && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-blue-400" />
                <h3 className="font-bold text-white text-sm">Location on Campus</h3>
                <span className="text-xs text-slate-400 ml-auto">{item.location}</span>
              </div>
              <Suspense fallback={<div className="h-48 bg-white/5 rounded-xl animate-pulse" />}>
                <CampusMap selectedLocation={item.location} readOnly height="220px" />
              </Suspense>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Activity Timeline */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-slate-400" />
              <h3 className="font-bold text-white text-sm">Activity Timeline</h3>
            </div>
            <div className="space-y-4">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      event.color === "blue" ? "bg-blue-500/20 text-blue-400"
                      : event.color === "yellow" ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-emerald-500/20 text-emerald-400"
                    }`}>{event.icon}</div>
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/8 mt-1.5" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-white">{event.label}</p>
                    {event.time && <p className="text-xs text-slate-500 mt-0.5">{event.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Matches */}
          {aiMatches.length > 0 && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-purple-400" />
                <h3 className="font-bold text-white text-sm">Possible Matches</h3>
              </div>
              <div className="space-y-3">
                {aiMatches.map((m, i) => {
                  const { label, color } = matchLabel(m.score);
                  return (
                    <Link key={i} to={`/items/${m.item.id}`}
                      className="block bg-white/3 border border-white/5 rounded-xl p-3 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black ${m.item.type === "lost" ? "text-red-400" : "text-emerald-400"}`}>
                          {m.item.type.toUpperCase()}
                        </span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${matchColors[color]}`}>{m.score}%</span>
                      </div>
                      <p className="text-sm font-medium text-white truncate">{m.item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{m.item.location}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showClaim && <ClaimModal item={item} onClose={() => setShowClaim(false)} />}
    </div>
  );
};

// Simple inline icon components for timeline
const PlusIcon = () => <span style={{fontSize:"10px",fontWeight:"bold"}}>+</span>;
const ClaimIcon = () => <span style={{fontSize:"9px",fontWeight:"bold"}}>✓</span>;
const ResolvedIcon = () => <span style={{fontSize:"9px",fontWeight:"bold"}}>★</span>;

export default ItemDetail;

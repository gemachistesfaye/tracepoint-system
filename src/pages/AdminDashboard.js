import React, { useEffect, useState } from "react";
import {
  getAllItems, getAllUsers, getAllClaims,
  updateClaim, updateItem, deleteItem, updateUserRole, addNotification,
} from "../firebase/firestore";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";
import {
  Users, Package, FileText, CheckCircle, XCircle,
  Trash2, Shield, ShieldOff, Loader2, BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("analytics");
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [i, u, c] = await Promise.all([getAllItems(), getAllUsers(), getAllClaims()]);
    setItems(i); setUsers(u); setClaims(c); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleClaim = async (claim, action) => {
    setProcessingId(claim.id);
    try {
      await updateClaim(claim.id, { status: action });
      if (action === "approved") {
        await updateItem(claim.itemId, { status: "resolved" });
        await addNotification(claim.claimantId, `Your claim for "${claim.itemTitle}" has been approved! 🎉`, "success");
      } else {
        await updateItem(claim.itemId, { status: "open" });
        await addNotification(claim.claimantId, `Your claim for "${claim.itemTitle}" was rejected.`, "error");
      }
      toast.success(`Claim ${action}`);
      await load();
    } catch { toast.error("Action failed"); }
    setProcessingId(null);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm("Delete this item?")) return;
    setProcessingId(item.id);
    try { await deleteItem(item.id); toast.success("Deleted"); await load(); }
    catch { toast.error("Delete failed"); }
    setProcessingId(null);
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setProcessingId(user.id);
    try { await updateUserRole(user.id, newRole); toast.success(`${user.name} → ${newRole}`); await load(); }
    catch { toast.error("Failed"); }
    setProcessingId(null);
  };

  const pendingClaims = claims.filter(c => c.status === "pending");

  const tabs = [
    { key: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
    { key: "claims", label: `Claims ${pendingClaims.length > 0 ? `(${pendingClaims.length})` : ""}`, icon: <FileText size={14} /> },
    { key: "items", label: "Items", icon: <Package size={14} /> },
    { key: "users", label: "Users", icon: <Users size={14} /> },
  ];

  const th = "px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-left bg-white/3";
  const td = "px-4 py-3 text-sm text-slate-300";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600/20 text-blue-400 p-3 rounded-2xl"><BarChart3 size={22} /></div>
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">TracePoint · Haramaya University</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/8 p-1 rounded-2xl w-fit mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div>
      ) : (
        <>
          {/* Analytics Tab */}
          {tab === "analytics" && <AnalyticsDashboard />}

          {/* Claims Tab */}
          {tab === "claims" && (
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr>
                    <th className={th}>Item</th><th className={th}>Claimant</th>
                    <th className={th}>Proof</th><th className={th}>Date</th>
                    <th className={th}>Status</th><th className={th}>Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {claims.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No claims yet</td></tr>
                    ) : claims.map(claim => (
                      <tr key={claim.id} className="hover:bg-white/3 transition-colors">
                        <td className={`${td} font-medium text-white`}>{claim.itemTitle}</td>
                        <td className={td}><p>{claim.claimantName}</p><p className="text-xs text-slate-500">{claim.claimantPhone}</p></td>
                        <td className={td}><p className="text-xs text-slate-400 max-w-xs line-clamp-2">{claim.proof}</p></td>
                        <td className={`${td} text-slate-500 text-xs`}>{formatDate(claim.createdAt)}</td>
                        <td className={td}>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                            claim.status === "pending" ? "bg-yellow-500/10 text-yellow-400"
                            : claim.status === "approved" ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                          }`}>{claim.status}</span>
                        </td>
                        <td className={td}>
                          {claim.status === "pending" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleClaim(claim, "approved")} disabled={processingId === claim.id}
                                className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50">
                                {processingId === claim.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                              </button>
                              <button onClick={() => handleClaim(claim, "rejected")} disabled={processingId === claim.id}
                                className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 disabled:opacity-50">
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {tab === "items" && (
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr>
                    <th className={th}>Title</th><th className={th}>Type</th><th className={th}>Category</th>
                    <th className={th}>Location</th><th className={th}>Reporter</th>
                    <th className={th}>Status</th><th className={th}>Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-white/3 transition-colors">
                        <td className={`${td} font-medium text-white max-w-xs truncate`}>{item.title}</td>
                        <td className={td}><span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>{item.type.toUpperCase()}</span></td>
                        <td className={`${td} text-slate-400`}>{item.category}</td>
                        <td className={`${td} text-slate-400`}>{item.location}</td>
                        <td className={`${td} text-slate-400`}>{item.reporterName}</td>
                        <td className={td}><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.status === "open" ? "bg-emerald-500/10 text-emerald-400"
                          : item.status === "claimed" ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-white/10 text-slate-400"
                        }`}>{item.status}</span></td>
                        <td className={td}>
                          <button onClick={() => handleDeleteItem(item)} disabled={processingId === item.id}
                            className="flex items-center gap-1 text-xs text-red-400 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            {processingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr>
                    <th className={th}>Name</th><th className={th}>Email</th><th className={th}>Student ID</th>
                    <th className={th}>Phone</th><th className={th}>Role</th><th className={th}>Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-white/3 transition-colors">
                        <td className={`${td} font-medium text-white`}>{user.name}</td>
                        <td className={`${td} text-slate-400`}>{user.email}</td>
                        <td className={`${td} text-slate-400`}>{user.studentId || "—"}</td>
                        <td className={`${td} text-slate-400`}>{user.phone || "—"}</td>
                        <td className={td}><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.role === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-slate-400"}`}>{user.role}</span></td>
                        <td className={td}>
                          <button onClick={() => toggleRole(user)} disabled={processingId === user.id}
                            className="flex items-center gap-1 text-xs border border-white/10 text-slate-400 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            {processingId === user.id ? <Loader2 size={12} className="animate-spin" /> : user.role === "admin" ? <ShieldOff size={12} /> : <Shield size={12} />}
                            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

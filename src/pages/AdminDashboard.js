import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  TrendingUp, AlertCircle, Eye, Clock,
} from "lucide-react";

const AdminDashboard = ({ tab: tabProp }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = () => {
    if (location.pathname.includes("/claims")) return "claims";
    if (location.pathname.includes("/items")) return "items";
    if (location.pathname.includes("/users")) return "users";
    return tabProp || "overview";
  };

  const [tab, setTab] = useState(getTabFromPath());
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { setTab(getTabFromPath()); }, [location.pathname]);

  const load = async () => {
    setLoading(true);
    const [i, u, c] = await Promise.all([getAllItems(), getAllUsers(), getAllClaims()]);
    setItems(i); setUsers(u); setClaims(c); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const switchTab = (key) => {
    setTab(key);
    const paths = { overview: "/admin", claims: "/admin/claims", items: "/admin/items", users: "/admin/users", analytics: "/analytics" };
    navigate(paths[key] || "/admin");
  };

  const handleClaim = async (claim, action) => {
    setProcessingId(claim.id);
    try {
      await updateClaim(claim.id, { status: action });
      if (action === "approved") {
        await updateItem(claim.itemId, { status: "resolved" });
        await addNotification(claim.claimantId, `✅ Your claim for "${claim.itemTitle}" has been approved!`, "success");
      } else {
        await updateItem(claim.itemId, { status: "open" });
        await addNotification(claim.claimantId, `❌ Your claim for "${claim.itemTitle}" was rejected.`, "error");
      }
      toast.success(`Claim ${action}`);
      await load();
    } catch { toast.error("Action failed"); }
    setProcessingId(null);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setProcessingId(item.id);
    try { await deleteItem(item.id); toast.success("Deleted"); await load(); }
    catch { toast.error("Delete failed"); }
    setProcessingId(null);
  };

  const toggleRole = async (user) => {
    if (!window.confirm(`Change ${user.name} to ${user.role === "admin" ? "user" : "admin"}?`)) return;
    const newRole = user.role === "admin" ? "user" : "admin";
    setProcessingId(user.id);
    try { await updateUserRole(user.id, newRole); toast.success(`${user.name} → ${newRole}`); await load(); }
    catch { toast.error("Failed"); }
    setProcessingId(null);
  };

  const pendingClaims = claims.filter(c => c.status === "pending");
  const resolved = items.filter(i => i.status === "resolved");
  const lostItems = items.filter(i => i.type === "lost");
  const foundItems = items.filter(i => i.type === "found");
  const recoveryRate = items.length ? Math.round((resolved.length / items.length) * 100) : 0;
  const admins = users.filter(u => u.role === "admin");

  const tabs = [
    { key: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
    { key: "claims", label: "Claims", icon: <FileText size={14} />, badge: pendingClaims.length },
    { key: "items", label: "Items", icon: <Package size={14} />, badge: items.length },
    { key: "users", label: "Users", icon: <Users size={14} />, badge: users.length },
    { key: "analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
  ];

  const th = "px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left bg-white/3 border-b border-white/8";
  const td = "px-4 py-3.5 text-sm";

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600/20 text-purple-400 p-3 rounded-2xl border border-purple-500/20">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Control Panel</h1>
              <p className="text-sm text-slate-400 mt-0.5">TracePoint · Haramaya University</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-purple-400">Admin Session Active</span>
          </div>
        </div>



        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Pending claims alert */}
                {pendingClaims.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-yellow-400" />
                      <div>
                        <p className="font-bold text-yellow-400">{pendingClaims.length} claim{pendingClaims.length > 1 ? "s" : ""} awaiting review</p>
                        <p className="text-xs text-slate-400 mt-0.5">Review and approve or reject ownership claims</p>
                      </div>
                    </div>
                    <button onClick={() => switchTab("claims")}
                      className="text-xs font-bold bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20 px-4 py-2 rounded-xl transition-colors">
                      Review Now →
                    </button>
                  </div>
                )}

                {/* Recent activity */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <h3 className="font-bold text-white">Recent Reports</h3>
                    <span className="text-xs text-slate-500 ml-auto">Last 10 items</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {items.slice(0, 10).map(item => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                          {item.type.toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.location} · {item.reporterName}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          item.status === "open" ? "bg-emerald-500/10 text-emerald-400"
                          : item.status === "claimed" ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-white/10 text-slate-400"
                        }`}>{item.status}</span>
                        <span className="text-xs text-slate-500 shrink-0 hidden sm:block">{formatDate(item.createdAt)}</span>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="py-12 text-center text-slate-500 text-sm">No items reported yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CLAIMS */}
            {tab === "claims" && (
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    <h3 className="font-bold text-white">Ownership Claims</h3>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg font-bold">{pendingClaims.length} pending</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-bold">{claims.filter(c => c.status === "approved").length} approved</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>
                      <th className={th}>Item</th><th className={th}>Claimant</th>
                      <th className={th}>Proof</th><th className={th}>Date</th>
                      <th className={th}>Status</th><th className={th}>Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {claims.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16 text-slate-500 text-sm">No claims submitted yet</td></tr>
                      ) : claims.map(claim => (
                        <tr key={claim.id} className={`hover:bg-white/3 transition-colors ${claim.status === "pending" ? "bg-yellow-500/3" : ""}`}>
                          <td className={`${td} font-semibold text-white max-w-[140px] truncate`}>{claim.itemTitle}</td>
                          <td className={td}>
                            <p className="text-slate-200 font-medium">{claim.claimantName}</p>
                            <p className="text-xs text-slate-500">{claim.claimantPhone}</p>
                            <p className="text-xs text-slate-500">{claim.claimantEmail}</p>
                          </td>
                          <td className={`${td} max-w-[200px]`}>
                            <p className="text-xs text-slate-400 line-clamp-2">{claim.proof}</p>
                          </td>
                          <td className={`${td} text-slate-500 text-xs whitespace-nowrap`}>{formatDate(claim.createdAt)}</td>
                          <td className={td}>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                              claim.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : claim.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>{claim.status}</span>
                          </td>
                          <td className={td}>
                            {claim.status === "pending" && (
                              <div className="flex gap-2">
                                <button onClick={() => handleClaim(claim, "approved")} disabled={processingId === claim.id}
                                  className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 font-semibold transition-colors">
                                  {processingId === claim.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Approve
                                </button>
                                <button onClick={() => handleClaim(claim, "rejected")} disabled={processingId === claim.id}
                                  className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 disabled:opacity-50 font-semibold transition-colors">
                                  <XCircle size={11} /> Reject
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

            {/* ITEMS */}
            {tab === "items" && (
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
                  <Package size={16} className="text-slate-400" />
                  <h3 className="font-bold text-white">All Items</h3>
                  <span className="text-xs text-slate-500 ml-auto">{items.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>
                      <th className={th}>Title</th><th className={th}>Type</th><th className={th}>Category</th>
                      <th className={th}>Location</th><th className={th}>Reporter</th>
                      <th className={th}>Status</th><th className={th}>Date</th><th className={th}>Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {items.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-16 text-slate-500 text-sm">No items yet</td></tr>
                      ) : items.map(item => (
                        <tr key={item.id} className="hover:bg-white/3 transition-colors group">
                          <td className={`${td} font-semibold text-white max-w-[140px] truncate`}>{item.title}</td>
                          <td className={td}>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {item.type.toUpperCase()}
                            </span>
                          </td>
                          <td className={`${td} text-slate-400`}>{item.category}</td>
                          <td className={`${td} text-slate-400 max-w-[120px] truncate`}>{item.location}</td>
                          <td className={`${td} text-slate-400`}>{item.reporterName}</td>
                          <td className={td}>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.status === "open" ? "bg-emerald-500/10 text-emerald-400"
                              : item.status === "claimed" ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-white/10 text-slate-400"
                            }`}>{item.status}</span>
                          </td>
                          <td className={`${td} text-slate-500 text-xs whitespace-nowrap`}>{formatDate(item.createdAt)}</td>
                          <td className={td}>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a href={`/items/${item.id}`} target="_blank" rel="noreferrer"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <Eye size={13} />
                              </a>
                              <button onClick={() => handleDeleteItem(item)} disabled={processingId === item.id}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                                {processingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === "users" && (
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
                  <Users size={16} className="text-slate-400" />
                  <h3 className="font-bold text-white">User Management</h3>
                  <span className="text-xs text-slate-500 ml-auto">{users.length} users · {admins.length} admin{admins.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>
                      <th className={th}>User</th><th className={th}>Student ID</th>
                      <th className={th}>Phone</th><th className={th}>Role</th><th className={th}>Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {users.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-16 text-slate-500 text-sm">No users yet</td></tr>
                      ) : users.map(user => (
                        <tr key={user.id} className="hover:bg-white/3 transition-colors">
                          <td className={td}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                                user.role === "admin" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-slate-600 to-slate-700"
                              }`}>
                                {user.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`${td} text-slate-400`}>{user.studentId || "—"}</td>
                          <td className={`${td} text-slate-400`}>{user.phone || "—"}</td>
                          <td className={td}>
                            <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
                                : "bg-white/8 text-slate-400 border border-white/8"
                            }`}>
                              {user.role === "admin" ? "⚡ Admin" : "Student"}
                            </span>
                          </td>
                          <td className={td}>
                            <button onClick={() => toggleRole(user)} disabled={processingId === user.id}
                              className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-semibold ${
                                user.role === "admin"
                                  ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                  : "border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                              }`}>
                              {processingId === user.id ? <Loader2 size={11} className="animate-spin" /> : user.role === "admin" ? <ShieldOff size={11} /> : <Shield size={11} />}
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

            {/* ANALYTICS */}
            {tab === "analytics" && <AnalyticsDashboard />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

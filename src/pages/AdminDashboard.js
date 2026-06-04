import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  getAllItems, getAllUsers, getAllClaims,
  updateClaim, updateItem, deleteItem, updateUserRole, addNotification,
} from "../firebase/firestore";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import { formatDate, timeAgo, STATUS_LABELS } from "../utils/helpers";
import toast from "react-hot-toast";
import {
  Users, Package, FileText, CheckCircle, XCircle,
  Trash2, Shield, ShieldOff, Loader2, Eye,
  Clock, AlertCircle, Search, Download, Filter,
  X, MapPin, Image, ChevronDown, CheckSquare,
  Calendar, TrendingUp, BarChart3,
} from "lucide-react";
import { lazy, Suspense } from "react";

const CampusMap = lazy(() => import("../components/map/CampusMap"));

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTab = () => {
    if (location.pathname.includes("/claims")) return "claims";
    if (location.pathname.includes("/items")) return "items";
    if (location.pathname.includes("/users")) return "users";
    return "overview";
  };

  const [tab, setTab] = useState(getTab());
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Search/filter state
  const [itemSearch, setItemSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [itemStatusFilter, setItemStatusFilter] = useState("");
  const [claimSearch, setClaimSearch] = useState("");
  const [claimStatusFilter, setClaimStatusFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMapView, setShowMapView] = useState(false);

  useEffect(() => { setTab(getTab()); }, [location.pathname]);

  const load = async () => {
    setLoading(true);
    const [i, u, c] = await Promise.all([getAllItems(), getAllUsers(), getAllClaims()]);
    setItems(i); setUsers(u); setClaims(c); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const switchTab = (key) => {
    setTab(key);
    setSelectedIds([]);
    const paths = { overview: "/admin", claims: "/admin/claims", items: "/admin/items", users: "/admin/users", analytics: "/analytics" };
    navigate(paths[key] || "/admin");
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleClaim = async (claim, action) => {
    setProcessingId(claim.id);
    try {
      await updateClaim(claim.id, { status: action });
      if (action === "approved") {
        await updateItem(claim.itemId, { status: "resolved" });
        await addNotification(claim.claimantId,
          `✅ Your claim for "${claim.itemTitle}" has been approved! Contact the reporter to collect it.`, "success");
      } else {
        await updateItem(claim.itemId, { status: "open" });
        await addNotification(claim.claimantId,
          `❌ Your claim for "${claim.itemTitle}" was rejected. Please contact admin for details.`, "error");
      }
      toast.success(`Claim ${action}`);
      setSelectedClaim(null);
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

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
    setProcessingId("bulk");
    try {
      await Promise.all(selectedIds.map(id => deleteItem(id)));
      toast.success(`${selectedIds.length} items deleted`);
      setSelectedIds([]);
      await load();
    } catch { toast.error("Bulk delete failed"); }
    setProcessingId(null);
  };

  const handleBulkResolve = async () => {
    if (!window.confirm(`Mark ${selectedIds.length} items as resolved?`)) return;
    setProcessingId("bulk");
    try {
      await Promise.all(selectedIds.map(id => updateItem(id, { status: "resolved" })));
      toast.success(`${selectedIds.length} items resolved`);
      setSelectedIds([]);
      await load();
    } catch { toast.error("Bulk resolve failed"); }
    setProcessingId(null);
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${user.name} to ${newRole}?`)) return;
    setProcessingId(user.id);
    try { await updateUserRole(user.id, newRole); toast.success(`${user.name} → ${newRole}`); await load(); }
    catch { toast.error("Failed"); }
    setProcessingId(null);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success(`Exported ${filename}.xlsx`);
  };

  const exportItems = () => exportToExcel(
    filteredItems.map(i => ({
      Title: i.title, Type: i.type, Category: i.category,
      Location: i.location, Status: i.status,
      Reporter: i.reporterName, Contact: i.reporterContact,
      Date: formatDate(i.createdAt),
    })), "tracepoint-items"
  );

  const exportClaims = () => exportToExcel(
    filteredClaims.map(c => ({
      Item: c.itemTitle, Claimant: c.claimantName,
      Email: c.claimantEmail, Phone: c.claimantPhone,
      Status: c.status, Proof: c.proof,
      Date: formatDate(c.createdAt),
    })), "tracepoint-claims"
  );

  const exportUsers = () => exportToExcel(
    filteredUsers.map(u => ({
      Name: u.name, Email: u.email,
      StudentID: u.studentId, Phone: u.phone, Role: u.role,
    })), "tracepoint-users"
  );

  // ── Filters ────────────────────────────────────────────────────────────────
  const inDateRange = (item) => {
    if (!dateFrom && !dateTo) return true;
    const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || 0);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  };

  const filteredItems = items.filter(i => {
    const q = itemSearch.toLowerCase();
    const match = !q || i.title?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q) || i.reporterName?.toLowerCase().includes(q);
    const type = !itemTypeFilter || i.type === itemTypeFilter;
    const status = !itemStatusFilter || i.status === itemStatusFilter;
    return match && type && status && inDateRange(i);
  });

  const filteredClaims = claims.filter(c => {
    const q = claimSearch.toLowerCase();
    const match = !q || c.itemTitle?.toLowerCase().includes(q) ||
      c.claimantName?.toLowerCase().includes(q) || c.claimantEmail?.toLowerCase().includes(q);
    const status = !claimStatusFilter || c.status === claimStatusFilter;
    return match && status;
  });

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q);
  });

  // ── Computed stats ─────────────────────────────────────────────────────────
  const pendingClaims = claims.filter(c => c.status === "pending");
  const resolved = items.filter(i => i.status === "resolved");
  const admins = users.filter(u => u.role === "admin");

  // avg resolution time
  const avgResolutionDays = (() => {
    const res = items.filter(i => i.status === "resolved" && i.createdAt && i.updatedAt);
    if (!res.length) return "—";
    const avg = res.reduce((sum, i) => {
      const c = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt);
      const u = i.updatedAt?.toDate ? i.updatedAt.toDate() : new Date(i.updatedAt);
      return sum + (u - c) / (1000 * 60 * 60 * 24);
    }, 0) / res.length;
    return avg < 1 ? "<1 day" : `${Math.round(avg)} days`;
  })();

  const th = "px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left bg-white/3 border-b border-white/8";
  const td = "px-4 py-3.5 text-sm";
  const inputClass = "bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all";
  const selectClass = "bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500";

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

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Users", value: users.length, sub: `${admins.length} admins`, icon: <Users size={16} />, color: "blue" },
            { label: "Pending Claims", value: pendingClaims.length, sub: "need review", icon: <AlertCircle size={16} />, color: pendingClaims.length > 0 ? "yellow" : "slate", urgent: pendingClaims.length > 0 },
            { label: "Total Items", value: items.length, sub: `${items.filter(i=>i.type==="lost").length}L · ${items.filter(i=>i.type==="found").length}F`, icon: <Package size={16} />, color: "purple" },
            { label: "Resolved", value: resolved.length, sub: `${items.length ? Math.round(resolved.length/items.length*100) : 0}% rate`, icon: <CheckCircle size={16} />, color: "emerald" },
            { label: "Avg Resolution", value: avgResolutionDays, sub: "per item", icon: <Clock size={16} />, color: "cyan" },
          ].map(s => (
            <div key={s.label} className={`bg-white/3 border rounded-2xl p-4 ${s.urgent ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/8"}`}>
              <div className={`inline-flex p-2 rounded-xl mb-2 text-xs ${
                s.color==="blue"?"bg-blue-500/10 text-blue-400":s.color==="yellow"?"bg-yellow-500/10 text-yellow-400":
                s.color==="purple"?"bg-purple-500/10 text-purple-400":s.color==="emerald"?"bg-emerald-500/10 text-emerald-400":
                s.color==="cyan"?"bg-cyan-500/10 text-cyan-400":"bg-white/10 text-slate-400"
              }`}>{s.icon}</div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-xs text-slate-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/3 border border-white/8 p-1 rounded-2xl w-fit mb-6 flex-wrap">
          {[
            { key:"overview", label:"Overview", icon:<BarChart3 size={13}/> },
            { key:"claims", label:"Claims", icon:<FileText size={13}/>, badge: pendingClaims.length },
            { key:"items", label:"Items", icon:<Package size={13}/>, badge: items.length },
            { key:"users", label:"Users", icon:<Users size={13}/>, badge: users.length },
            { key:"analytics", label:"Analytics", icon:<TrendingUp size={13}/> },
          ].map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab===t.key ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              {t.icon}{t.label}
              {t.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab===t.key?"bg-white/20 text-white":"bg-white/10 text-slate-300"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div className="space-y-6">
                {pendingClaims.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-yellow-400" />
                      <div>
                        <p className="font-bold text-yellow-400">{pendingClaims.length} claim{pendingClaims.length>1?"s":""} awaiting review</p>
                        <p className="text-xs text-slate-400 mt-0.5">Review and approve or reject ownership claims</p>
                      </div>
                    </div>
                    <button onClick={() => switchTab("claims")}
                      className="text-xs font-bold bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20 px-4 py-2 rounded-xl transition-colors">
                      Review Now →
                    </button>
                  </div>
                )}

                {/* Map view of all items */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-400" />
                      <h3 className="font-bold text-white text-sm">Campus Item Map</h3>
                      <span className="text-xs text-slate-500">{items.filter(i=>i.status==="open").length} active reports</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"/>Lost</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"/>Found</span>
                    </div>
                  </div>
                  <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse"/>}>
                    <CampusMap items={items} readOnly height="280px" />
                  </Suspense>
                </div>

                {/* Recent activity */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400"/>
                      <h3 className="font-bold text-white">Recent Reports</h3>
                    </div>
                    <span className="text-xs text-slate-500">Last 10 items</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {items.slice(0,10).map(item => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"/>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Package size={16} className="text-slate-500"/>
                          </div>
                        )}
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${item.type==="lost"?"bg-red-500/20 text-red-400":"bg-emerald-500/20 text-emerald-400"}`}>
                          {item.type.toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.location} · {item.reporterName}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          item.status==="open"?"bg-emerald-500/10 text-emerald-400":item.status==="claimed"?"bg-yellow-500/10 text-yellow-400":"bg-white/10 text-slate-400"
                        }`}>{item.status}</span>
                        <span className="text-xs text-slate-500 shrink-0 hidden sm:block">{timeAgo(item.createdAt)}</span>
                      </div>
                    ))}
                    {items.length===0 && <div className="py-12 text-center text-slate-500 text-sm">No items yet</div>}
                  </div>
                </div>
              </div>
            )}

            {/* ── CLAIMS ── */}
            {tab === "claims" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={claimSearch} onChange={e=>setClaimSearch(e.target.value)} placeholder="Search claims..."
                      className={`${inputClass} pl-8 w-full`}/>
                  </div>
                  <select value={claimStatusFilter} onChange={e=>setClaimStatusFilter(e.target.value)} className={selectClass}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={exportClaims}
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-2 rounded-xl transition-colors font-medium">
                    <Download size={13}/> Export
                  </button>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-slate-400"/>
                      <h3 className="font-bold text-white text-sm">Ownership Claims</h3>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg font-bold">{pendingClaims.length} pending</span>
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-bold">{claims.filter(c=>c.status==="approved").length} approved</span>
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
                        {filteredClaims.length===0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No claims found</td></tr>
                        ) : filteredClaims.map(claim => (
                          <tr key={claim.id} className={`hover:bg-white/3 transition-colors cursor-pointer ${claim.status==="pending"?"bg-yellow-500/3":""}`}
                            onClick={() => setSelectedClaim(claim)}>
                            <td className={`${td} font-semibold text-white max-w-[130px] truncate`}>{claim.itemTitle}</td>
                            <td className={td}>
                              <p className="text-slate-200 font-medium">{claim.claimantName}</p>
                              <p className="text-xs text-slate-500">{claim.claimantPhone}</p>
                            </td>
                            <td className={`${td} max-w-[180px]`}>
                              <p className="text-xs text-slate-400 line-clamp-2">{claim.proof}</p>
                            </td>
                            <td className={`${td} text-slate-500 text-xs`}>{formatDate(claim.createdAt)}</td>
                            <td className={td}>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize border ${
                                claim.status==="pending"?"bg-yellow-500/10 text-yellow-400 border-yellow-500/20":
                                claim.status==="approved"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":
                                "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>{claim.status}</span>
                            </td>
                            <td className={td} onClick={e=>e.stopPropagation()}>
                              {claim.status==="pending" && (
                                <div className="flex gap-2">
                                  <button onClick={()=>handleClaim(claim,"approved")} disabled={processingId===claim.id}
                                    className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 font-semibold transition-colors">
                                    {processingId===claim.id?<Loader2 size={11} className="animate-spin"/>:<CheckCircle size={11}/>} Approve
                                  </button>
                                  <button onClick={()=>handleClaim(claim,"rejected")} disabled={processingId===claim.id}
                                    className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 disabled:opacity-50 font-semibold transition-colors">
                                    <XCircle size={11}/> Reject
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
              </div>
            )}

            {/* ── ITEMS ── */}
            {tab === "items" && (
              <div className="space-y-4">
                {/* Filters + bulk actions */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                  <div className="relative min-w-48 flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={itemSearch} onChange={e=>setItemSearch(e.target.value)} placeholder="Search items..."
                      className={`${inputClass} pl-8 w-full`}/>
                  </div>
                  <select value={itemTypeFilter} onChange={e=>setItemTypeFilter(e.target.value)} className={selectClass}>
                    <option value="">All Types</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                  <select value={itemStatusFilter} onChange={e=>setItemStatusFilter(e.target.value)} className={selectClass}>
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="claimed">Claimed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <div className="flex gap-2">
                    <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className={selectClass} title="From date"/>
                    <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className={selectClass} title="To date"/>
                  </div>
                  <button onClick={exportItems}
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-2 rounded-xl transition-colors font-medium">
                    <Download size={13}/> Export
                  </button>
                  {selectedIds.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={handleBulkResolve} disabled={processingId==="bulk"}
                        className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl hover:bg-emerald-500/20 font-semibold disabled:opacity-50">
                        <CheckSquare size={12}/> Resolve ({selectedIds.length})
                      </button>
                      <button onClick={handleBulkDelete} disabled={processingId==="bulk"}
                        className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500/20 font-semibold disabled:opacity-50">
                        <Trash2 size={12}/> Delete ({selectedIds.length})
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-2">
                    <Package size={15} className="text-slate-400"/>
                    <h3 className="font-bold text-white text-sm">All Items</h3>
                    <span className="text-xs text-slate-500 ml-auto">{filteredItems.length} of {items.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className={`${th} w-10`}>
                          <input type="checkbox" className="rounded"
                            checked={selectedIds.length===filteredItems.length && filteredItems.length>0}
                            onChange={e => setSelectedIds(e.target.checked ? filteredItems.map(i=>i.id) : [])}/>
                        </th>
                        <th className={th}>Item</th><th className={th}>Type</th>
                        <th className={th}>Category</th><th className={th}>Location</th>
                        <th className={th}>Reporter</th><th className={th}>Status</th>
                        <th className={th}>Date</th><th className={th}>Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.length===0 ? (
                          <tr><td colSpan={9} className="text-center py-12 text-slate-500 text-sm">No items found</td></tr>
                        ) : filteredItems.map(item => (
                          <tr key={item.id} className="hover:bg-white/3 transition-colors group">
                            <td className={td} onClick={e=>e.stopPropagation()}>
                              <input type="checkbox" className="rounded"
                                checked={selectedIds.includes(item.id)}
                                onChange={e => setSelectedIds(prev => e.target.checked ? [...prev,item.id] : prev.filter(i=>i!==item.id))}/>
                            </td>
                            <td className={td}>
                              <div className="flex items-center gap-2">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0 cursor-pointer"
                                    onClick={()=>setSelectedItem(item)}/>
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Image size={13} className="text-slate-600"/>
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-white max-w-[120px] truncate">{item.title}</span>
                              </div>
                            </td>
                            <td className={td}>
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.type==="lost"?"bg-red-500/20 text-red-400":"bg-emerald-500/20 text-emerald-400"}`}>
                                {item.type.toUpperCase()}
                              </span>
                            </td>
                            <td className={`${td} text-slate-400`}>{item.category}</td>
                            <td className={`${td} text-slate-400 max-w-[110px] truncate`}>{item.location}</td>
                            <td className={`${td} text-slate-400`}>{item.reporterName}</td>
                            <td className={td}>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                item.status==="open"?"bg-emerald-500/10 text-emerald-400":
                                item.status==="claimed"?"bg-yellow-500/10 text-yellow-400":"bg-white/10 text-slate-400"
                              }`}>{item.status}</span>
                            </td>
                            <td className={`${td} text-slate-500 text-xs`}>{formatDate(item.createdAt)}</td>
                            <td className={td}>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={`/items/${item.id}`} target="_blank" rel="noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                  <Eye size={13}/>
                                </a>
                                <button onClick={()=>handleDeleteItem(item)} disabled={processingId===item.id}
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                                  {processingId===item.id?<Loader2 size={13} className="animate-spin"/>:<Trash2 size={13}/>}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <div className="space-y-4">
                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users..."
                      className={`${inputClass} pl-8 w-full`}/>
                  </div>
                  <button onClick={exportUsers}
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-2 rounded-xl transition-colors font-medium">
                    <Download size={13}/> Export
                  </button>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-2">
                    <Users size={15} className="text-slate-400"/>
                    <h3 className="font-bold text-white text-sm">User Management</h3>
                    <span className="text-xs text-slate-500 ml-auto">{filteredUsers.length} users · {admins.length} admins</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className={th}>User</th><th className={th}>Student ID</th>
                        <th className={th}>Phone</th><th className={th}>Items</th>
                        <th className={th}>Role</th><th className={th}>Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.length===0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No users found</td></tr>
                        ) : filteredUsers.map(user => {
                          const userItems = items.filter(i=>i.reportedBy===user.id).length;
                          return (
                            <tr key={user.id} className="hover:bg-white/3 transition-colors">
                              <td className={td}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                                    user.role==="admin"?"bg-gradient-to-br from-purple-500 to-indigo-600":"bg-gradient-to-br from-slate-600 to-slate-700"
                                  }`}>{user.name?.[0]?.toUpperCase()||"?"}</div>
                                  <div>
                                    <p className="text-sm font-semibold text-white">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className={`${td} text-slate-400`}>{user.studentId||"—"}</td>
                              <td className={`${td} text-slate-400`}>{user.phone||"—"}</td>
                              <td className={td}>
                                <span className="text-xs bg-white/8 text-slate-300 px-2 py-0.5 rounded-lg">{userItems} reports</span>
                              </td>
                              <td className={td}>
                                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
                                  user.role==="admin"?"bg-purple-500/20 text-purple-400 border border-purple-500/20":"bg-white/8 text-slate-400 border border-white/8"
                                }`}>{user.role==="admin"?"⚡ Admin":"Student"}</span>
                              </td>
                              <td className={td}>
                                <button onClick={()=>toggleRole(user)} disabled={processingId===user.id}
                                  className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-semibold ${
                                    user.role==="admin"?"border-red-500/20 text-red-400 hover:bg-red-500/10":"border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                                  }`}>
                                  {processingId===user.id?<Loader2 size={11} className="animate-spin"/>:user.role==="admin"?<ShieldOff size={11}/>:<Shield size={11}/>}
                                  {user.role==="admin"?"Remove Admin":"Make Admin"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {tab==="analytics" && <AnalyticsDashboard />}
          </>
        )}
      </div>

      {/* Claim detail modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1629] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h3 className="font-bold text-white">Claim Details</h3>
              <button onClick={()=>setSelectedClaim(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:"Item",value:selectedClaim.itemTitle},
                  {label:"Claimant",value:selectedClaim.claimantName},
                  {label:"Email",value:selectedClaim.claimantEmail},
                  {label:"Phone",value:selectedClaim.claimantPhone},
                  {label:"Status",value:selectedClaim.status},
                  {label:"Submitted",value:formatDate(selectedClaim.createdAt)},
                ].map(f=>(
                  <div key={f.label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-semibold text-white mt-0.5 capitalize">{f.value||"—"}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Proof of Ownership</p>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedClaim.proof}</p>
              </div>
              {selectedClaim.additionalInfo && (
                <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Additional Info</p>
                  <p className="text-sm text-slate-300">{selectedClaim.additionalInfo}</p>
                </div>
              )}
              {selectedClaim.status==="pending" && (
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>handleClaim(selectedClaim,"approved")} disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                    {processingId?<Loader2 size={14} className="animate-spin"/>:<CheckCircle size={14}/>} Approve Claim
                  </button>
                  <button onClick={()=>handleClaim(selectedClaim,"rejected")} disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                    <XCircle size={14}/> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setSelectedItem(null)}>
          <div className="relative max-w-2xl w-full">
            <button onClick={()=>setSelectedItem(null)} className="absolute -top-10 right-0 text-white/60 hover:text-white"><X size={24}/></button>
            <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full rounded-2xl shadow-2xl"/>
            <p className="text-center text-white font-bold mt-3">{selectedItem.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

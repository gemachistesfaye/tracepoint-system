import React, { useEffect, useState, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  getAllItems, getAllUsers, getAllClaims, getStorageStats,
  updateClaim, updateItem, deleteItem, updateUserRole, addNotification,
} from "../firebase/firestore";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import { formatDate, timeAgo } from "../utils/helpers";
import toast from "react-hot-toast";
import {
  Users, Package, FileText, CheckCircle, XCircle,
  Trash2, Shield, ShieldOff, Loader2, Eye,
  Clock, AlertCircle, Search, Download,
  X, MapPin, Image, CheckSquare,
  TrendingUp, BarChart3,
} from "lucide-react";

const CampusMap = lazy(() => import("../components/map/CampusMap"));
const AuditLog = lazy(() => import("../components/admin/AuditLog"));

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

  const [itemSearch, setItemSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [itemStatusFilter, setItemStatusFilter] = useState("");
  const [claimSearch, setClaimSearch] = useState("");
  const [claimStatusFilter, setClaimStatusFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [storageStats, setStorageStats] = useState(null);

  useEffect(() => { setTab(getTab()); }, [location.pathname]);

  const load = async () => {
    setLoading(true);
    const [i, u, c, s] = await Promise.all([getAllItems(), getAllUsers(), getAllClaims(), getStorageStats()]);
    setItems(i); setUsers(u); setClaims(c); setStorageStats(s); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const switchTab = (key) => {
    setTab(key);
    setSelectedIds([]);
    const paths = { overview: "/admin", claims: "/admin/claims", items: "/admin/items", users: "/admin/users", audit: "/admin/audit", analytics: "/analytics" };
    navigate(paths[key] || "/admin");
  };

  const handleClaim = async (claim, action) => {
    setProcessingId(claim.id);
    try {
      await updateClaim(claim.id, { status: action });
      if (action === "approved") {
        await updateItem(claim.itemId, { status: "resolved" }, claim.itemType);
        await addNotification(claim.claimantId,
          `Your claim for "${claim.itemTitle}" has been approved! Contact the reporter to collect it.`, "success");
      } else {
        await updateItem(claim.itemId, { status: "open" }, claim.itemType);
        await addNotification(claim.claimantId,
          `Your claim for "${claim.itemTitle}" was rejected. Please contact admin for details.`, "error");
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
    try { await deleteItem(item.id, item.type); toast.success("Deleted"); await load(); }
    catch { toast.error("Delete failed"); }
    setProcessingId(null);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
    setProcessingId("bulk");
    try {
      const toDelete = items.filter(i => selectedIds.includes(i.id));
      await Promise.all(toDelete.map(i => deleteItem(i.id, i.type)));
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
      const toResolve = items.filter(i => selectedIds.includes(i.id));
      await Promise.all(toResolve.map(i => updateItem(i.id, { status: "resolved" }, i.type)));
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
    try { await updateUserRole(user.id, newRole); toast.success(`${user.name} -> ${newRole}`); await load(); }
    catch { toast.error("Failed"); }
    setProcessingId(null);
  };

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
    })), "hu-lost-found-items"
  );

  const exportClaims = () => exportToExcel(
    filteredClaims.map(c => ({
      Item: c.itemTitle, Claimant: c.claimantName,
      Email: c.claimantEmail, Phone: c.claimantPhone,
      Status: c.status, Proof: c.proof,
      Date: formatDate(c.createdAt),
    })), "hu-lost-found-claims"
  );

  const exportUsers = () => exportToExcel(
    filteredUsers.map(u => ({
      Name: u.name, Email: u.email,
      StudentID: u.studentId, Phone: u.phone, Role: u.role,
    })), "hu-lost-found-users"
  );

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

  const pendingClaims = claims.filter(c => c.status === "pending");
  const resolved = items.filter(i => i.status === "resolved");
  const admins = users.filter(u => u.role === "admin");

  const avgResolutionDays = (() => {
    const res = items.filter(i => i.status === "resolved" && i.createdAt && i.updatedAt);
    if (!res.length) return "\u2014";
    const avg = res.reduce((sum, i) => {
      const c = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt);
      const u = i.updatedAt?.toDate ? i.updatedAt.toDate() : new Date(i.updatedAt);
      return sum + (u - c) / (1000 * 60 * 60 * 24);
    }, 0) / res.length;
    return avg < 1 ? "<1 day" : `${Math.round(avg)} days`;
  })();

  const th = "px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-left bg-gray-50 border-b border-gray-200";
  const td = "px-4 py-3.5 text-sm";
  const inputClass = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";
  const selectClass = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-50 text-primary-600 p-3 rounded-2xl border border-primary-200">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Admin Control Panel</h1>
              <p className="text-sm text-gray-500 mt-0.5">HU Lost & Found &middot; Haramaya University</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-primary-50 border border-primary-200 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-primary-600">Admin Session Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Users", value: users.length, sub: `${admins.length} admins`, icon: <Users size={16} />, color: "blue" },
            { label: "Pending Claims", value: pendingClaims.length, sub: "need review", icon: <AlertCircle size={16} />, color: pendingClaims.length > 0 ? "yellow" : "slate", urgent: pendingClaims.length > 0 },
            { label: "Total Items", value: items.length, sub: `${items.filter(i=>i.type==="lost").length}L \u00b7 ${items.filter(i=>i.type==="found").length}F`, icon: <Package size={16} />, color: "green" },
            { label: "Resolved", value: resolved.length, sub: `${items.length ? Math.round(resolved.length/items.length*100) : 0}% rate`, icon: <CheckCircle size={16} />, color: "emerald" },
            { label: "Avg Resolution", value: avgResolutionDays, sub: "per item", icon: <Clock size={16} />, color: "cyan" },
          ].map(s => (
            <div key={s.label} className={`bg-white border rounded-2xl p-4 shadow-sm ${s.urgent ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
              <div className={`inline-flex p-2 rounded-xl mb-2 text-xs ${
                s.color==="blue"?"bg-blue-50 text-blue-600":s.color==="yellow"?"bg-amber-50 text-amber-600":
                s.color==="green"?"bg-primary-50 text-primary-600":s.color==="emerald"?"bg-emerald-50 text-emerald-600":
                s.color==="cyan"?"bg-cyan-50 text-cyan-600":"bg-gray-100 text-gray-500"
              }`}>{s.icon}</div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-2xl w-fit mb-6 flex-wrap">
          {[
            { key:"overview", label:"Overview", icon:<BarChart3 size={13}/> },
            { key:"claims", label:"Claims", icon:<FileText size={13}/>, badge: pendingClaims.length },
            { key:"items", label:"Items", icon:<Package size={13}/>, badge: items.length },
            { key:"users", label:"Users", icon:<Users size={13}/>, badge: users.length },
            { key:"storage", label:"Storage", icon:<Package size={13}/> },
            { key:"audit", label:"Audit Log", icon:<Clock size={13}/> },
            { key:"analytics", label:"Analytics", icon:<TrendingUp size={13}/> },
          ].map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab===t.key ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}>
              {t.icon}{t.label}
              {t.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab===t.key?"bg-white/20 text-white":"bg-gray-200 text-gray-600"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <div className="space-y-6">
                {pendingClaims.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-amber-500" />
                      <div>
                        <p className="font-bold text-amber-700">{pendingClaims.length} claim{pendingClaims.length>1?"s":""} awaiting review</p>
                        <p className="text-xs text-gray-500 mt-0.5">Review and approve or reject ownership claims</p>
                      </div>
                    </div>
                    <button onClick={() => switchTab("claims")}
                      className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl transition-colors">
                      Review Now &rarr;
                    </button>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary-500" />
                      <h3 className="font-bold text-gray-900 text-sm">Campus Item Map</h3>
                      <span className="text-xs text-gray-400">{items.filter(i=>i.status==="open").length} active reports</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"/>Lost</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"/>Found</span>
                    </div>
                  </div>
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-2xl animate-pulse"/>}>
                    <CampusMap items={items} readOnly height="300px" showFilter />
                  </Suspense>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400"/>
                      <h3 className="font-bold text-gray-900">Recent Reports</h3>
                    </div>
                    <span className="text-xs text-gray-400">Last 10 items</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.slice(0,10).map(item => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"/>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={16} className="text-gray-400"/>
                          </div>
                        )}
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${item.type==="lost"?"bg-red-100 text-red-600":"bg-emerald-100 text-emerald-600"}`}>
                          {item.type.toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.location} &middot; {item.reporterName}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          item.status==="open"?"bg-emerald-50 text-emerald-600":item.status==="claimed"?"bg-amber-50 text-amber-600":"bg-gray-100 text-gray-500"
                        }`}>{item.status}</span>
                        <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{timeAgo(item.createdAt)}</span>
                      </div>
                    ))}
                    {items.length===0 && <div className="py-12 text-center text-gray-400 text-sm">No items yet</div>}
                  </div>
                </div>
              </div>
            )}

            {tab === "claims" && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 shadow-sm">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
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
                    className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl transition-colors font-medium">
                    <Download size={13}/> Export
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-gray-400"/>
                      <h3 className="font-bold text-gray-900 text-sm">Ownership Claims</h3>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-bold border border-amber-200">{pendingClaims.length} pending</span>
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-bold border border-emerald-200">{claims.filter(c=>c.status==="approved").length} approved</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className={th}>Item</th><th className={th}>Claimant</th>
                        <th className={th}>Proof</th><th className={th}>Date</th>
                        <th className={th}>Status</th><th className={th}>Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredClaims.length===0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No claims found</td></tr>
                        ) : filteredClaims.map(claim => (
                          <tr key={claim.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${claim.status==="pending"?"bg-amber-50/50":""}`}
                            onClick={() => setSelectedClaim(claim)}>
                            <td className={`${td} font-semibold text-gray-900 max-w-[130px] truncate`}>{claim.itemTitle}</td>
                            <td className={td}>
                              <p className="text-gray-700 font-medium">{claim.claimantName}</p>
                              <p className="text-xs text-gray-400">{claim.claimantPhone}</p>
                            </td>
                            <td className={`${td} max-w-[180px]`}>
                              <p className="text-xs text-gray-500 line-clamp-2">{claim.proof}</p>
                            </td>
                            <td className={`${td} text-gray-400 text-xs`}>{formatDate(claim.createdAt)}</td>
                            <td className={td}>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize border ${
                                claim.status==="pending"?"bg-amber-50 text-amber-600 border-amber-200":
                                claim.status==="approved"?"bg-emerald-50 text-emerald-600 border-emerald-200":
                                "bg-red-50 text-red-500 border-red-200"
                              }`}>{claim.status}</span>
                            </td>
                            <td className={td} onClick={e=>e.stopPropagation()}>
                              {claim.status==="pending" && (
                                <div className="flex gap-2">
                                  <button onClick={()=>handleClaim(claim,"approved")} disabled={processingId===claim.id}
                                    className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-50 font-semibold transition-colors">
                                    {processingId===claim.id?<Loader2 size={11} className="animate-spin"/>:<CheckCircle size={11}/>} Approve
                                  </button>
                                  <button onClick={()=>handleClaim(claim,"rejected")} disabled={processingId===claim.id}
                                    className="flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50 font-semibold transition-colors">
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

            {tab === "items" && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
                  <div className="relative min-w-48 flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
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
                    className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl transition-colors font-medium">
                    <Download size={13}/> Export
                  </button>
                  {selectedIds.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={handleBulkResolve} disabled={processingId==="bulk"}
                        className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-2 rounded-xl hover:bg-emerald-100 font-semibold disabled:opacity-50">
                        <CheckSquare size={12}/> Resolve ({selectedIds.length})
                      </button>
                      <button onClick={handleBulkDelete} disabled={processingId==="bulk"}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100 font-semibold disabled:opacity-50">
                        <Trash2 size={12}/> Delete ({selectedIds.length})
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Package size={15} className="text-gray-400"/>
                    <h3 className="font-bold text-gray-900 text-sm">All Items</h3>
                    <span className="text-xs text-gray-400 ml-auto">{filteredItems.length} of {items.length}</span>
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
                      <tbody className="divide-y divide-gray-100">
                        {filteredItems.length===0 ? (
                          <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No items found</td></tr>
                        ) : filteredItems.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                            <td className={td} onClick={e=>e.stopPropagation()}>
                              <input type="checkbox" className="rounded"
                                checked={selectedIds.includes(item.id)}
                                onChange={e => setSelectedIds(prev => e.target.checked ? [...prev,item.id] : prev.filter(i=>i!==item.id))}/>
                            </td>
                            <td className={td}>
                              <div className="flex items-center gap-2">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0 cursor-pointer"
                                    onClick={()=>setSelectedItem(item)}/>
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <Image size={13} className="text-gray-400"/>
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">{item.title}</span>
                              </div>
                            </td>
                            <td className={td}>
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.type==="lost"?"bg-red-100 text-red-600":"bg-emerald-100 text-emerald-600"}`}>
                                {item.type.toUpperCase()}
                              </span>
                            </td>
                            <td className={`${td} text-gray-500`}>{item.category}</td>
                            <td className={`${td} text-gray-500 max-w-[110px] truncate`}>{item.location}</td>
                            <td className={`${td} text-gray-500`}>{item.reporterName}</td>
                            <td className={td}>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                item.status==="open"?"bg-emerald-50 text-emerald-600":
                                item.status==="claimed"?"bg-amber-50 text-amber-600":"bg-gray-100 text-gray-500"
                              }`}>{item.status}</span>
                            </td>
                            <td className={`${td} text-gray-400 text-xs`}>{formatDate(item.createdAt)}</td>
                            <td className={td}>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={`/items/${item.id}`} target="_blank" rel="noreferrer"
                                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                  <Eye size={13}/>
                                </a>
                                <button onClick={()=>handleDeleteItem(item)} disabled={processingId===item.id}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
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

            {tab === "users" && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 shadow-sm">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users..."
                      className={`${inputClass} pl-8 w-full`}/>
                  </div>
                  <button onClick={exportUsers}
                    className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl transition-colors font-medium">
                    <Download size={13}/> Export
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Users size={15} className="text-gray-400"/>
                    <h3 className="font-bold text-gray-900 text-sm">User Management</h3>
                    <span className="text-xs text-gray-400 ml-auto">{filteredUsers.length} users &middot; {admins.length} admins</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr>
                        <th className={th}>User</th><th className={th}>Student ID</th>
                        <th className={th}>Phone</th><th className={th}>Items</th>
                        <th className={th}>Role</th><th className={th}>Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length===0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No users found</td></tr>
                        ) : filteredUsers.map(user => {
                          const userItems = items.filter(i=>i.reportedBy===user.id).length;
                          return (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className={td}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                                    user.role==="admin"?"bg-gradient-to-br from-purple-500 to-indigo-600":"bg-gradient-to-br from-primary-400 to-primary-600"
                                  }`}>{user.name?.[0]?.toUpperCase()||"?"}</div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className={`${td} text-gray-500`}>{user.studentId||"\u2014"}</td>
                              <td className={`${td} text-gray-500`}>{user.phone||"\u2014"}</td>
                              <td className={td}>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{userItems} reports</span>
                              </td>
                              <td className={td}>
                                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
                                  user.role==="admin"?"bg-purple-50 text-purple-600 border border-purple-200":"bg-gray-100 text-gray-500 border border-gray-200"
                                }`}>{user.role==="admin"?"Admin":"Student"}</span>
                              </td>
                              <td className={td}>
                                <button onClick={()=>toggleRole(user)} disabled={processingId===user.id}
                                  className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-semibold ${
                                    user.role==="admin"?"border-red-200 text-red-500 hover:bg-red-50":"border-primary-200 text-primary-600 hover:bg-primary-50"
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

            {tab==="analytics" && <AnalyticsDashboard />}

            {tab==="storage" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Item Images", value: storageStats?.totalItems || 0, icon: <Image size={18} />, color: "blue" },
                    { label: "Lost Item Images", value: storageStats?.lostWithImages || 0, icon: <Package size={18} />, color: "red" },
                    { label: "Found Item Images", value: storageStats?.foundWithImages || 0, icon: <Package size={18} />, color: "emerald" },
                    { label: "Profile Images", value: storageStats?.totalProfiles || 0, icon: <Users size={18} />, color: "purple" },
                  ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${
                        s.color==="blue"?"bg-blue-50 text-blue-600":s.color==="red"?"bg-red-50 text-red-600":
                        s.color==="emerald"?"bg-emerald-50 text-emerald-600":"bg-purple-50 text-purple-600"
                      }`}>{s.icon}</div>
                      <p className="text-3xl font-black text-gray-900">{s.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Package size={16} className="text-gray-400" />
                    <h3 className="font-bold text-gray-900">Storage Information</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>Item images are stored in Firebase Storage under the <code className="bg-gray-100 px-2 py-0.5 rounded">items/</code> folder.</p>
                    <p>Profile images are stored under <code className="bg-gray-100 px-2 py-0.5 rounded">profiles/</code> folder.</p>
                    <p>Claim proof images are stored under <code className="bg-gray-100 px-2 py-0.5 rounded">claims/</code> folder.</p>
                    <p>Message attachments are stored under <code className="bg-gray-100 px-2 py-0.5 rounded">messages/</code> folder.</p>
                  </div>
                </div>
              </div>
            )}

            {tab==="audit" && (
              <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
                <AuditLog />
              </Suspense>
            )}
          </>
        )}
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Claim Details</h3>
              <button onClick={()=>setSelectedClaim(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={18}/></button>
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
                  <div key={f.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{f.value||"\u2014"}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Proof of Ownership</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedClaim.proof}</p>
              </div>
              {selectedClaim.additionalInfo && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Additional Info</p>
                  <p className="text-sm text-gray-600">{selectedClaim.additionalInfo}</p>
                </div>
              )}
              {selectedClaim.status==="pending" && (
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>handleClaim(selectedClaim,"approved")} disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                    {processingId?<Loader2 size={14} className="animate-spin"/>:<CheckCircle size={14}/>} Approve Claim
                  </button>
                  <button onClick={()=>handleClaim(selectedClaim,"rejected")} disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                    <XCircle size={14}/> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setSelectedItem(null)}>
          <div className="relative max-w-2xl w-full">
            <button onClick={()=>setSelectedItem(null)} className="absolute -top-10 right-0 text-white/80 hover:text-white"><X size={24}/></button>
            <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full rounded-2xl shadow-2xl"/>
            <p className="text-center text-white font-bold mt-3">{selectedItem.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import {
  getAllItems, getAllUsers, getAllClaims,
  updateClaim, updateItem, deleteItem,
  updateUserRole, addNotification,
} from "../firebase/firestore";
import { formatDate, STATUS_COLORS, STATUS_LABELS } from "../utils/helpers";
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
  const [tab, setTab] = useState("overview");
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [i, u, c] = await Promise.all([getAllItems(), getAllUsers(), getAllClaims()]);
    setItems(i);
    setUsers(u);
    setClaims(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Claims ─────────────────────────────────────────────────────────────────
  const handleClaim = async (claim, action) => {
    setProcessingId(claim.id);
    try {
      await updateClaim(claim.id, { status: action });
      if (action === "approved") {
        await updateItem(claim.itemId, { status: "resolved" });
        await addNotification(claim.claimantId,
          `Your claim for "${claim.itemTitle}" has been approved! Contact the reporter to collect it.`, "success");
      } else {
        await updateItem(claim.itemId, { status: "open" });
        await addNotification(claim.claimantId,
          `Your claim for "${claim.itemTitle}" was rejected. Please contact admin for details.`, "error");
      }
      toast.success(`Claim ${action}`);
      await load();
    } catch { toast.error("Action failed"); }
    setProcessingId(null);
  };

  // ── Items ──────────────────────────────────────────────────────────────────
  const handleDeleteItem = async (item) => {
    if (!window.confirm("Delete this item?")) return;
    setProcessingId(item.id);
    try {
      await deleteItem(item.id);
      toast.success("Item deleted");
      await load();
    } catch { toast.error("Delete failed"); }
    setProcessingId(null);
  };

  // ── Users ──────────────────────────────────────────────────────────────────
  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setProcessingId(user.id);
    try {
      await updateUserRole(user.id, newRole);
      toast.success(`${user.name} is now ${newRole}`);
      await load();
    } catch { toast.error("Role update failed"); }
    setProcessingId(null);
  };

  const stats = [
    { label: "Total Users", value: users.length, icon: <Users size={20} />, color: "text-blue-600 bg-blue-50" },
    { label: "Total Items", value: items.length, icon: <Package size={20} />, color: "text-purple-600 bg-purple-50" },
    { label: "Pending Claims", value: claims.filter(c => c.status === "pending").length, icon: <FileText size={20} />, color: "text-yellow-600 bg-yellow-50" },
    { label: "Resolved", value: items.filter(i => i.status === "resolved").length, icon: <CheckCircle size={20} />, color: "text-emerald-600 bg-emerald-50" },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "claims", label: `Claims (${claims.filter(c => c.status === "pending").length})` },
    { key: "items", label: "All Items" },
    { key: "users", label: "Users" },
  ];

  const tdClass = "px-4 py-3 text-sm text-gray-700";
  const thClass = "px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 text-white p-2.5 rounded-xl">
          <BarChart3 size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">TracePoint — Haramaya University</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${s.color}`}>{s.icon}</div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Claims ── */}
          {tab === "claims" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thClass}>Item</th>
                    <th className={thClass}>Claimant</th>
                    <th className={thClass}>Proof</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No claims yet</td></tr>
                  ) : claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className={`${tdClass} font-medium`}>{claim.itemTitle}</td>
                      <td className={tdClass}>
                        <p>{claim.claimantName}</p>
                        <p className="text-xs text-gray-400">{claim.claimantPhone}</p>
                      </td>
                      <td className={`${tdClass} max-w-xs`}>
                        <p className="text-xs text-gray-500 line-clamp-2">{claim.proof}</p>
                      </td>
                      <td className={`${tdClass} text-gray-400 text-xs`}>{formatDate(claim.createdAt)}</td>
                      <td className={tdClass}>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          claim.status === "pending" ? "bg-yellow-100 text-yellow-700"
                          : claim.status === "approved" ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {claim.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClaim(claim, "approved")}
                              disabled={processingId === claim.id}
                              className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50"
                            >
                              {processingId === claim.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleClaim(claim, "rejected")}
                              disabled={processingId === claim.id}
                              className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50"
                            >
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
          )}

          {/* ── Items ── */}
          {tab === "items" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thClass}>Title</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Location</th>
                    <th className={thClass}>Reporter</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className={`${tdClass} font-medium max-w-xs truncate`}>{item.title}</td>
                      <td className={tdClass}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.type === "lost" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                        }`}>
                          {item.type.toUpperCase()}
                        </span>
                      </td>
                      <td className={`${tdClass} text-gray-500`}>{item.category}</td>
                      <td className={`${tdClass} text-gray-500`}>{item.location}</td>
                      <td className={`${tdClass} text-gray-500`}>{item.reporterName}</td>
                      <td className={tdClass}>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {processingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Student ID</th>
                    <th className={thClass}>Phone</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className={`${tdClass} font-medium`}>{user.name}</td>
                      <td className={`${tdClass} text-gray-500`}>{user.email}</td>
                      <td className={`${tdClass} text-gray-500`}>{user.studentId || "—"}</td>
                      <td className={`${tdClass} text-gray-500`}>{user.phone || "—"}</td>
                      <td className={tdClass}>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <button
                          onClick={() => toggleRole(user)}
                          disabled={processingId === user.id}
                          className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {processingId === user.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : user.role === "admin" ? (
                            <ShieldOff size={12} />
                          ) : (
                            <Shield size={12} />
                          )}
                          {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

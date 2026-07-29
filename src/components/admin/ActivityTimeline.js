import React, { useEffect, useState } from "react";
import { subscribeToAuditLogs } from "../../firebase/firestore";
import { timeAgo } from "../../utils/helpers";
import {
  Clock, CheckCircle, XCircle, Trash2, Shield,
  FileText, AlertCircle, Loader2,
} from "lucide-react";

const actionConfig = {
  claim_approved: { icon: <CheckCircle size={14} />, color: "bg-emerald-100 text-emerald-600", label: "approved a claim" },
  claim_rejected: { icon: <XCircle size={14} />, color: "bg-red-100 text-red-500", label: "rejected a claim" },
  item_deleted: { icon: <Trash2 size={14} />, color: "bg-red-100 text-red-500", label: "deleted an item" },
  item_resolved: { icon: <CheckCircle size={14} />, color: "bg-primary-100 text-primary-600", label: "resolved an item" },
  user_role_changed: { icon: <Shield size={14} />, color: "bg-purple-100 text-purple-600", label: "changed user role" },
  user_deleted: { icon: <Trash2 size={14} />, color: "bg-red-100 text-red-500", label: "deleted a user" },
  announcement: { icon: <FileText size={14} />, color: "bg-blue-100 text-blue-600", label: "sent an announcement" },
  bulk_delete: { icon: <Trash2 size={14} />, color: "bg-red-100 text-red-500", label: "bulk deleted items" },
  bulk_resolve: { icon: <CheckCircle size={14} />, color: "bg-emerald-100 text-emerald-600", label: "bulk resolved items" },
};

const defaultConfig = { icon: <AlertCircle size={14} />, color: "bg-gray-100 text-gray-500", label: "performed an action" };

const AdminActivityTimeline = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuditLogs((data) => {
      setLogs(data.slice(0, 20));
      setLoading(false);
    }, { limit: 20 });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock size={32} className="mx-auto mb-2 opacity-20" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log, i) => {
        const config = actionConfig[log.action] || defaultConfig;
        return (
          <div key={log.id} className="flex gap-3 py-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                {config.icon}
              </div>
              {i < logs.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">{log.adminName || "Admin"}</span>{" "}
                {config.label}
                {log.targetTitle && (
                  <span className="font-medium text-gray-900"> &ldquo;{log.targetTitle}&rdquo;</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminActivityTimeline;

import React, { useState, useEffect } from "react";
import { getAuditLogs, subscribeToAuditLogs } from "../../firebase/firestore";
import { formatDate, timeAgo } from "../../utils/helpers";
import { Shield, Search, Loader2, RefreshCw } from "lucide-react";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuditLogs((data) => {
      setLogs(data);
      setLoading(false);
    }, { limit: 100 });
    return unsub;
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = !filter ||
      log.userName?.toLowerCase().includes(filter.toLowerCase()) ||
      log.targetType?.toLowerCase().includes(filter.toLowerCase()) ||
      JSON.stringify(log.changes)?.toLowerCase().includes(filter.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const getActionBadge = (action) => {
    const styles = {
      created: "bg-emerald-50 text-emerald-600 border-emerald-200",
      updated: "bg-blue-50 text-blue-600 border-blue-200",
      deleted: "bg-red-50 text-red-500 border-red-200",
      claim_processed: "bg-amber-50 text-amber-600 border-amber-200",
    };
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${styles[action] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
        {action}
      </span>
    );
  };

  const th = "px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left bg-gray-50 border-b border-gray-200";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="claim_processed">Claim Processed</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Shield size={15} className="text-gray-400" />
          <h3 className="font-bold text-gray-900 text-sm">Audit Trail</h3>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>Time</th>
                  <th className={th}>Action</th>
                  <th className={th}>User</th>
                  <th className={th}>Target</th>
                  <th className={th}>Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No audit logs found</td>
                  </tr>
                ) : filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${td} text-gray-400 text-xs whitespace-nowrap`}>
                      <div>{formatDate(log.timestamp)}</div>
                      <div className="text-gray-300">{timeAgo(log.timestamp)}</div>
                    </td>
                    <td className={td}>{getActionBadge(log.action)}</td>
                    <td className={td}>
                      <p className="text-sm font-medium text-gray-900">{log.userName || "System"}</p>
                      <p className="text-xs text-gray-400">{log.userId?.slice(0, 8)}...</p>
                    </td>
                    <td className={td}>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg capitalize">{log.targetType}</span>
                      <p className="text-xs text-gray-400 mt-1">{log.targetId?.slice(0, 12)}...</p>
                    </td>
                    <td className={`${td} max-w-[200px]`}>
                      <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono">
                        {JSON.stringify(log.changes, null, 2)?.slice(0, 100)}
                        {JSON.stringify(log.changes)?.length > 100 ? "..." : ""}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;

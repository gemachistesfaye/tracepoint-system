import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToNotifications, markNotificationRead } from "../../firebase/firestore";
import { timeAgo } from "../../utils/helpers";

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToNotifications(currentUser.uid, setNotifications);
  }, [currentUser]);

  const unread = notifications.filter(n => !n.read);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) unread.forEach(n => markNotificationRead(n.id));
  };

  return (
    <div className="relative">
      <button onClick={handleOpen}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
        <Bell size={20} />
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unread.length > 0 && (
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{unread.length} new</span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">No notifications yet</div>
              ) : notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 text-sm ${!n.read ? "bg-blue-500/5" : ""} hover:bg-white/5 transition-colors`}>
                  <p className="text-slate-300">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default NotificationBell;

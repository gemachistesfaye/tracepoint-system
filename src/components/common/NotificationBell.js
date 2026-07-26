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
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
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
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              {unread.length > 0 && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unread.length} new</span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No notifications yet</div>
              ) : notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 text-sm ${!n.read ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors`}>
                  <p className="text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
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

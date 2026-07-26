import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToNotifications, markAllNotificationsRead } from "../../firebase/firestore";
import { requestNotificationPermission } from "../../firebase/messaging";

/**
 * Custom hook for managing notifications (Firestore + FCM)
 */
export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsub = subscribeToNotifications(currentUser.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    // Request FCM permission on mount
    requestNotificationPermission();

    return unsub;
  }, [currentUser]);

  const unread = notifications.filter(n => !n.read);
  const unreadCount = unread.length;

  const markAllRead = async () => {
    if (!currentUser) return;
    await markAllNotificationsRead(currentUser.uid);
  };

  return {
    notifications,
    unread,
    unreadCount,
    loading,
    markAllRead,
  };
};

export default useNotifications;

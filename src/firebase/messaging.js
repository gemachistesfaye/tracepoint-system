/**
 * Firebase Cloud Messaging (FCM) service
 * Handles push notification permission, token management, and foreground messages
 */

import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { messaging, db, auth } from "./config";

/**
 * Request notification permission and save FCM token
 */
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn("FCM not supported in this environment");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY || "",
    });

    if (token) {
      // Save token to user profile
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { fcmToken: token });
      }
      return token;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
  return null;
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

/**
 * Remove FCM token on logout
 */
export const removeFCMToken = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await updateDoc(doc(db, "users", user.uid), { fcmToken: null });
    } catch (error) {
      console.warn("Error removing FCM token:", error);
    }
  }
};

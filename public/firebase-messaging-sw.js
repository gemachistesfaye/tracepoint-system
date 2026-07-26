/* eslint-disable no-restricted-globals */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyApWO0fqC6v5IwQRmjknqYPw18XfJaFqIQ",
  authDomain: "tracepoint-system.firebaseapp.com",
  projectId: "tracepoint-system",
  storageBucket: "tracepoint-system.firebasestorage.app",
  messagingSenderId: "392431040387",
  appId: "1:392431040387:web:093c15ecc2484eeb6c68b6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "HU Lost & Found";
  const options = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/logo192.png",
    badge: "/favicon.ico",
    tag: payload.data?.click_action || "default",
    data: { url: payload.data?.click_action || "/notifications" },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

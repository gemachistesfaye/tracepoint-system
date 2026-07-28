/* eslint-disable no-restricted-globals */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "REPLACE_AT_BUILD_TIME",
  authDomain: "REPLACE_AT_BUILD_TIME",
  projectId: "REPLACE_AT_BUILD_TIME",
  storageBucket: "REPLACE_AT_BUILD_TIME",
  messagingSenderId: "REPLACE_AT_BUILD_TIME",
  appId: "REPLACE_AT_BUILD_TIME",
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
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
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

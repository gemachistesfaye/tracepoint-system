import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyApWO0fqC6v5IwQRmjknqYPw18XfJaFqIQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tracepoint-system.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tracepoint-system",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tracepoint-system.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "392431040387",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:392431040387:web:093c15ecc2484eeb6c68b6",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-W5FHXCKH0F",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

let messaging = null;
try {
  if (typeof window !== "undefined" && "Notification" in window) {
    messaging = getMessaging(app);
  }
} catch (e) {
  // Messaging not supported in this environment
}
export { messaging };

export default app;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApWO0fqC6v5IwQRmjknqYPw18XfJaFqIQ",
  authDomain: "tracepoint-system.firebaseapp.com",
  projectId: "tracepoint-system",
  storageBucket: "tracepoint-system.firebasestorage.app",
  messagingSenderId: "392431040387",
  appId: "1:392431040387:web:093c15ecc2484eeb6c68b6",
  measurementId: "G-W5FHXCKH0F",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;

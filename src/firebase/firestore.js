import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config";

// ─── ITEMS ────────────────────────────────────────────────────────────────────

export const addItem = async (itemData) => {
  const ref = await addDoc(collection(db, "items"), {
    ...itemData,
    status: "open",       // open | claimed | resolved
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateItem = async (itemId, data) => {
  const ref = doc(db, "items", itemId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteItem = async (itemId) => {
  await deleteDoc(doc(db, "items", itemId));
};

export const getItem = async (itemId) => {
  const snap = await getDoc(doc(db, "items", itemId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllItems = async (filters = {}) => {
  let q = collection(db, "items");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.type) constraints.unshift(where("type", "==", filters.type));
  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.category) constraints.unshift(where("category", "==", filters.category));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToItems = (callback, filters = {}) => {
  let q = collection(db, "items");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.type) constraints.unshift(where("type", "==", filters.type));
  if (filters.status) constraints.unshift(where("status", "==", filters.status));

  return onSnapshot(query(q, ...constraints), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// ─── CLAIMS ───────────────────────────────────────────────────────────────────

export const submitClaim = async (claimData) => {
  const ref = await addDoc(collection(db, "claims"), {
    ...claimData,
    status: "pending",    // pending | approved | rejected
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateClaim = async (claimId, data) => {
  const ref = doc(db, "claims", claimId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const getAllClaims = async (filters = {}) => {
  let q = collection(db, "claims");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.itemId) constraints.unshift(where("itemId", "==", filters.itemId));
  if (filters.claimantId) constraints.unshift(where("claimantId", "==", filters.claimantId));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const createUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  }).catch(async () => {
    // Doc doesn't exist yet — use set via addDoc workaround
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", uid), {
      ...data,
      role: "user",
      createdAt: serverTimestamp(),
    });
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUserRole = async (uid, role) => {
  await updateDoc(doc(db, "users", uid), { role });
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const addNotification = async (userId, message, type = "info") => {
  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const markNotificationRead = async (notifId) => {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
};

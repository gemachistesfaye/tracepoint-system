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
  startAfter,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "./config";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOST ITEMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const addLostItem = async (itemData) => {
  const ref = await addDoc(collection(db, "lostItems"), {
    ...itemData,
    type: "lost",
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getLostItems = async (filters = {}) => {
  let q = collection(db, "lostItems");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.category) constraints.unshift(where("category", "==", filters.category));
  if (filters.location) constraints.unshift(where("location", "==", filters.location));
  if (filters.reportedBy) constraints.unshift(where("reportedBy", "==", filters.reportedBy));
  if (filters.limit) constraints.push(limit(filters.limit));
  if (filters.startAfter) constraints.push(startAfter(filters.startAfter));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToLostItems = (callback, filters = {}) => {
  let q = collection(db, "lostItems");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.reportedBy) constraints.unshift(where("reportedBy", "==", filters.reportedBy));
  if (filters.limit) constraints.push(limit(filters.limit));

  return onSnapshot(query(q, ...constraints), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FOUND ITEMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const addFoundItem = async (itemData) => {
  const ref = await addDoc(collection(db, "foundItems"), {
    ...itemData,
    type: "found",
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getFoundItems = async (filters = {}) => {
  let q = collection(db, "foundItems");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.category) constraints.unshift(where("category", "==", filters.category));
  if (filters.location) constraints.unshift(where("location", "==", filters.location));
  if (filters.reportedBy) constraints.unshift(where("reportedBy", "==", filters.reportedBy));
  if (filters.limit) constraints.push(limit(filters.limit));
  if (filters.startAfter) constraints.push(startAfter(filters.startAfter));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToFoundItems = (callback, filters = {}) => {
  let q = collection(db, "foundItems");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.reportedBy) constraints.unshift(where("reportedBy", "==", filters.reportedBy));
  if (filters.limit) constraints.push(limit(filters.limit));

  return onSnapshot(query(q, ...constraints), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ITEMS (backward-compatible — dispatches to correct collection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const addItem = async (itemData) => {
  if (itemData.type === "found") {
    return addFoundItem(itemData);
  }
  return addLostItem(itemData);
};

export const updateItem = async (itemId, data, itemType) => {
  // Determine collection from type if provided
  const col = itemType === "found" ? "foundItems" : "lostItems";
  const ref = doc(db, col, itemId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteItem = async (itemId, itemType) => {
  const col = itemType === "found" ? "foundItems" : "lostItems";
  await deleteDoc(doc(db, col, itemId));
};

export const getItem = async (itemId, itemType) => {
  // Try the specified collection first, then fall back to the other
  const collections = itemType === "found"
    ? ["foundItems", "lostItems"]
    : ["lostItems", "foundItems"];

  for (const col of collections) {
    const snap = await getDoc(doc(db, col, itemId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const getAllItems = async (filters = {}) => {
  const [lostItems, foundItems] = await Promise.all([
    getLostItems(filters),
    getFoundItems(filters),
  ]);

  const allItems = [...lostItems, ...foundItems];

  // Sort by createdAt descending
  allItems.sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return db - da;
  });

  return filters.limit ? allItems.slice(0, filters.limit) : allItems;
};

export const subscribeToItems = (callback, filters = {}) => {
  let lostUnsub = null;
  let foundUnsub = null;
  let lostItems = [];
  let foundItems = [];

  const emit = () => {
    const allItems = [...lostItems, ...foundItems];
    allItems.sort((a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return db - da;
    });
    callback(allItems);
  };

  lostUnsub = subscribeToLostItems((items) => {
    lostItems = items;
    emit();
  }, filters);

  foundUnsub = subscribeToFoundItems((items) => {
    foundItems = items;
    emit();
  }, filters);

  return () => {
    if (lostUnsub) lostUnsub();
    if (foundUnsub) foundUnsub();
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLAIMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const submitClaim = async (claimData) => {
  const ref = await addDoc(collection(db, "claims"), {
    ...claimData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateClaim = async (claimId, data) => {
  const ref = doc(db, "claims", claimId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const getClaim = async (claimId) => {
  const snap = await getDoc(doc(db, "claims", claimId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllClaims = async (filters = {}) => {
  let q = collection(db, "claims");
  const constraints = [orderBy("createdAt", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.itemId) constraints.unshift(where("itemId", "==", filters.itemId));
  if (filters.claimantId) constraints.unshift(where("claimantId", "==", filters.claimantId));
  if (filters.limit) constraints.push(limit(filters.limit));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATCHES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const addMatch = async (matchData) => {
  const ref = await addDoc(collection(db, "matches"), {
    ...matchData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getMatches = async (filters = {}) => {
  let q = collection(db, "matches");
  const constraints = [orderBy("matchScore", "desc")];

  if (filters.lostItemId) constraints.unshift(where("lostItemId", "==", filters.lostItemId));
  if (filters.foundItemId) constraints.unshift(where("foundItemId", "==", filters.foundItemId));
  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.limit) constraints.push(limit(filters.limit));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToMatches = (callback, filters = {}) => {
  let q = collection(db, "matches");
  const constraints = [orderBy("matchScore", "desc")];

  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  if (filters.limit) constraints.push(limit(filters.limit || 20));

  return onSnapshot(query(q, ...constraints), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  }).catch(async () => {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", uid), {
      ...data,
      role: "user",
      status: "active",
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

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
};

export const updateUserRole = async (uid, role) => {
  await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
};

export const getUserStats = async (uid) => {
  const [lostItems, foundItems, claims] = await Promise.all([
    getLostItems({ reportedBy: uid }),
    getFoundItems({ reportedBy: uid }),
    getAllClaims({ claimantId: uid }),
  ]);
  return {
    lostReported: lostItems.length,
    foundReported: foundItems.length,
    claimsSubmitted: claims.length,
    itemsReturned: [...lostItems, ...foundItems].filter(i => i.status === "resolved").length,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const addNotification = async (userId, message, type = "info", title = null) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    title: title || (type === "success" ? "Success" : type === "error" ? "Error" : "Notification"),
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
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const markNotificationRead = async (notifId) => {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
};

export const markAllNotificationsRead = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createConversation = async (participants, participantNames) => {
  const ref = await addDoc(collection(db, "messages"), {
    participants,
    participantNames,
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    unreadCount: {},
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getOrCreateConversation = async (userId1, userId2, name1, name2) => {
  // Check for existing conversation between these two users
  const q = query(
    collection(db, "messages"),
    where("participants", "array-contains", userId1)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => {
    const data = d.data();
    return data.participants.includes(userId2);
  });

  if (existing) return existing.id;

  return createConversation(
    [userId1, userId2],
    { [userId1]: name1, [userId2]: name2 }
  );
};

export const sendMessage = async (convId, senderId, text, senderName) => {
  const msgRef = await addDoc(collection(db, `messages/${convId}/messages`), {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(db, "messages", convId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${senderId}`]: 0,
  });

  return msgRef.id;
};

export const subscribeToMessages = (convId, callback) => {
  const q = query(
    collection(db, `messages/${convId}/messages`),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const getConversations = async (userId) => {
  const q = query(
    collection(db, "messages"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToConversations = (userId, callback) => {
  const q = query(
    collection(db, "messages"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const markMessagesRead = async (convId, userId) => {
  await updateDoc(doc(db, "messages", convId), {
    [`unreadCount.${userId}`]: 0,
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILDINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const getAllBuildings = async () => {
  const snap = await getDocs(collection(db, "buildings"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUDIT LOGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const addAuditLog = async (logData) => {
  await addDoc(collection(db, "auditLogs"), {
    ...logData,
    timestamp: serverTimestamp(),
  });
};

export const getAuditLogs = async (filters = {}) => {
  let q = collection(db, "auditLogs");
  const constraints = [orderBy("timestamp", "desc")];

  if (filters.userId) constraints.unshift(where("userId", "==", filters.userId));
  if (filters.targetType) constraints.unshift(where("targetType", "==", filters.targetType));
  if (filters.limit) constraints.push(limit(filters.limit || 50));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToAuditLogs = (callback, filters = {}) => {
  let q = collection(db, "auditLogs");
  const constraints = [orderBy("timestamp", "desc")];

  if (filters.targetType) constraints.unshift(where("targetType", "==", filters.targetType));
  if (filters.limit) constraints.push(limit(filters.limit || 50));

  return onSnapshot(query(q, ...constraints), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

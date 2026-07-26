/**
 * Messages Firebase service
 * Handles conversations and real-time messaging
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Create a new conversation between two users
 */
export const createConversation = async (userId1, userId2, name1, name2) => {
  const ref = await addDoc(collection(db, "messages"), {
    participants: [userId1, userId2],
    participantNames: { [userId1]: name1, [userId2]: name2 },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (userId1, userId2, name1, name2) => {
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
  return createConversation(userId1, userId2, name1, name2);
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (convId, senderId, text, senderName) => {
  const msgRef = await addDoc(collection(db, `messages/${convId}/messages`), {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(db, "messages", convId), {
    lastMessage: text.length > 50 ? text.slice(0, 50) + "..." : text,
    lastMessageAt: serverTimestamp(),
  });

  return msgRef.id;
};

/**
 * Subscribe to messages in a conversation (real-time)
 */
export const subscribeToMessages = (convId, callback) => {
  const q = query(
    collection(db, `messages/${convId}/messages`),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

/**
 * Subscribe to user's conversations (real-time)
 */
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

/**
 * Get all conversations for a user
 */
export const getConversations = async (userId) => {
  const q = query(
    collection(db, "messages"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get a single conversation
 */
export const getConversation = async (convId) => {
  const snap = await getDoc(doc(db, "messages", convId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Mark messages as read in a conversation
 */
export const markMessagesRead = async (convId) => {
  const q = query(
    collection(db, `messages/${convId}/messages`),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const batchPromises = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(batchPromises);
};

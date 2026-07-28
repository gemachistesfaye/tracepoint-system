/**
 * Cleanup Cloud Functions
 * Scheduled functions for data maintenance
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");

/**
 * Clean up old notifications (older than 90 days)
 */
const cleanupOldNotifications = onSchedule("every 24 hours", async (event) => {
  console.log("Running notification cleanup...");

  const { getFirestore } = require("firebase-admin/firestore");
  const db = getFirestore();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  try {
    const snap = await db.collection("notifications")
      .where("createdAt", "<", cutoff)
      .limit(500)
      .get();

    if (snap.empty) {
      console.log("No old notifications to clean up.");
      return;
    }

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snap.docs.length} old notifications.`);
  } catch (error) {
    console.error("Notification cleanup error:", error);
  }
});

/**
 * Clean up expired rate limit entries (older than 1 hour)
 */
const cleanupRateLimits = onSchedule("every 6 hours", async (event) => {
  console.log("Running rate limit cleanup...");

  const { getFirestore } = require("firebase-admin/firestore");
  const db = getFirestore();

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 1);

  try {
    const snap = await db.collection("rateLimits")
      .where("timestamp", "<", cutoff)
      .limit(500)
      .get();

    if (snap.empty) {
      console.log("No old rate limits to clean up.");
      return;
    }

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snap.docs.length} old rate limit entries.`);
  } catch (error) {
    console.error("Rate limit cleanup error:", error);
  }
});

/**
 * Clean up old audit logs (older than 6 months)
 */
const cleanupOldAuditLogs = onSchedule("every 24 hours", async (event) => {
  console.log("Running audit log cleanup...");

  const { getFirestore } = require("firebase-admin/firestore");
  const db = getFirestore();

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);

  try {
    const snap = await db.collection("auditLogs")
      .where("timestamp", "<", cutoff)
      .limit(500)
      .get();

    if (snap.empty) {
      console.log("No old audit logs to clean up.");
      return;
    }

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snap.docs.length} old audit logs.`);
  } catch (error) {
    console.error("Audit log cleanup error:", error);
  }
});

module.exports = {
  cleanupOldNotifications,
  cleanupRateLimits,
  cleanupOldAuditLogs,
};

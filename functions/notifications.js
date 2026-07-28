/**
 * Notification Cloud Functions
 * Sends FCM push notifications for matches, claims, returns
 */

const handleMatchCreated = async (event, db, messaging) => {
  const match = event.data?.data();
  const matchId = event.params.matchId;
  if (!match) return;

  console.log(`Sending notifications for match: ${matchId}`);

  try {
    const [lostItemSnap, foundItemSnap] = await Promise.all([
      db.collection("lostItems").doc(match.lostItemId).get(),
      db.collection("foundItems").doc(match.foundItemId).get(),
    ]);

    const lostItem = lostItemSnap.data();
    const foundItem = foundItemSnap.data();

    if (lostItem?.reportedBy) {
      await db.collection("notifications").add({
        userId: lostItem.reportedBy,
        title: "Possible Match Found",
        message: `A found item "${match.foundItemTitle}" may match your lost item "${match.lostItemTitle}" (${match.matchScore}% match)`,
        type: "match",
        matchId,
        read: false,
        createdAt: new Date(),
      });

      await sendPushNotification(db, messaging, lostItem.reportedBy, {
        title: "Possible Match Found!",
        body: `A found item may match your lost "${match.lostItemTitle}"`,
      });
    }

    if (foundItem?.reportedBy) {
      await db.collection("notifications").add({
        userId: foundItem.reportedBy,
        title: "Possible Match Found",
        message: `A lost item "${match.lostItemTitle}" may match your found item "${match.foundItemTitle}" (${match.matchScore}% match)`,
        type: "match",
        matchId,
        read: false,
        createdAt: new Date(),
      });

      await sendPushNotification(db, messaging, foundItem.reportedBy, {
        title: "Possible Match Found!",
        body: `A lost item may match your found "${match.foundItemTitle}"`,
      });
    }

    console.log(`Notifications sent for match ${matchId}`);
  } catch (error) {
    console.error("Error sending match notifications:", error);
  }
};

const handleClaimStatusChanged = async (event, db, messaging) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const claimId = event.params.claimId;

  if (!before || !after || before.status === after.status) return;

  console.log(`Claim ${claimId} status changed: ${before.status} -> ${after.status}`);

  try {
    // Check notification preferences
    const prefsSnap = await db.collection("notificationPreferences").doc(after.claimantId).get();
    const prefs = prefsSnap.data() || {};
    if (prefs.claimUpdates === false) return;

    const message = after.status === "approved"
      ? `Your claim for "${after.itemTitle}" has been approved! Contact the Lost & Found office to collect it.`
      : `Your claim for "${after.itemTitle}" was not approved. Please contact the admin for details.`;

    await db.collection("notifications").add({
      userId: after.claimantId,
      title: after.status === "approved" ? "Claim Approved" : "Claim Update",
      message,
      type: after.status === "approved" ? "success" : "error",
      read: false,
      createdAt: new Date(),
    });

    await sendPushNotification(db, messaging, after.claimantId, {
      title: after.status === "approved" ? "Claim Approved!" : "Claim Update",
      body: message,
    });

    console.log(`Claim notification sent to ${after.claimantId}`);
  } catch (error) {
    console.error("Error sending claim notification:", error);
  }
};

const handleItemReturned = async (event, db, messaging) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const itemId = event.params.itemId;

  if (!before || !after) return;
  if (before.status === after.status || after.status !== "resolved") return;

  console.log(`Item ${itemId} returned/resolved`);

  try {
    const prefsSnap = await db.collection("notificationPreferences").doc(after.reportedBy).get();
    const prefs = prefsSnap.data() || {};
    if (prefs.claimUpdates === false) return;

    const notification = {
      userId: after.reportedBy,
      title: "Item Resolved",
      message: `Your ${after.type || "item"} report "${after.title}" has been resolved.`,
      type: "success",
      read: false,
      createdAt: new Date(),
    };

    await db.collection("notifications").add(notification);
    await sendPushNotification(db, messaging, after.reportedBy, {
      title: "Item Resolved!",
      body: `Your "${after.title}" has been returned.`,
    });

    console.log(`Return notification sent for item ${itemId}`);
  } catch (error) {
    console.error("Error sending return notification:", error);
  }
};

const handleClaimSubmitted = async (event, db, messaging) => {
  const claim = event.data?.data();
  const claimId = event.params.claimId;
  if (!claim) return;

  console.log(`New claim submitted: ${claimId}`);

  try {
    const itemCol = claim.itemType === "found" ? "foundItems" : "lostItems";
    const itemSnap = await db.collection(itemCol).doc(claim.itemId).get();
    const item = itemSnap.data();

    if (item?.reportedBy && item.reportedBy !== claim.claimantId) {
      await db.collection("notifications").add({
        userId: item.reportedBy,
        title: "New Claim Submitted",
        message: `${claim.claimantName || "Someone"} has submitted a claim for your item "${claim.itemTitle}".`,
        type: "info",
        read: false,
        createdAt: new Date(),
      });

      await sendPushNotification(db, messaging, item.reportedBy, {
        title: "New Claim Submitted",
        body: `Someone claimed your "${claim.itemTitle}"`,
      });
    }
  } catch (error) {
    console.error("Error sending claim submitted notification:", error);
  }
};

/**
 * Helper: Send FCM push notification to a user
 */
const sendPushNotification = async (db, messaging, userId, payload) => {
  try {
    const userSnap = await db.collection("users").doc(userId).get();
    const user = userSnap.data();
    if (!user?.fcmToken) return;

    await messaging.send({
      token: user.fcmToken,
      notification: payload,
      data: { click_action: "/notifications" },
    });
  } catch (error) {
    console.warn(`FCM send failed for user ${userId}:`, error.message);
  }
};

module.exports = {
  handleMatchCreated,
  handleClaimStatusChanged,
  handleItemReturned,
  handleClaimSubmitted,
};

/**
 * Audit Log Cloud Functions
 * Tracks all create/update/delete operations
 */

const handleItemCreated = async (event, db, collection) => {
  const item = event.data?.data();
  if (!item) return;

  try {
    await db.collection("auditLogs").add({
      action: "created",
      userId: item.reportedBy || "unknown",
      userName: item.reporterName || "Unknown",
      targetType: collection === "lostItems" ? "lostItem" : "foundItem",
      targetId: event.params.itemId,
      changes: {
        title: item.title,
        category: item.category,
        location: item.location,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log error (create):", error);
  }
};

const handleItemUpdated = async (event, db, collection) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;

  // Find changed fields
  const changes = {};
  const trackedFields = ["status", "title", "category", "location", "description"];
  for (const field of trackedFields) {
    if (JSON.stringify(before[field]) !== JSON.stringify(after[field])) {
      changes[field] = { from: before[field], to: after[field] };
    }
  }

  if (Object.keys(changes).length === 0) return;

  try {
    await db.collection("auditLogs").add({
      action: "updated",
      userId: after.reportedBy || "unknown",
      userName: after.reporterName || "Unknown",
      targetType: collection === "lostItems" ? "lostItem" : "foundItem",
      targetId: event.params.itemId,
      changes,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log error (update):", error);
  }
};

const handleItemDeleted = async (event, db, collection) => {
  const item = event.data?.data();
  if (!item) return;

  try {
    await db.collection("auditLogs").add({
      action: "deleted",
      userId: item.reportedBy || "unknown",
      userName: item.reporterName || "Unknown",
      targetType: collection === "lostItems" ? "lostItem" : "foundItem",
      targetId: event.params.itemId,
      changes: { title: item.title },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log error (delete):", error);
  }
};

const handleClaimProcessed = async (event, db) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after || before.status === after.status) return;

  try {
    await db.collection("auditLogs").add({
      action: "claim_processed",
      userId: after.claimantId || "unknown",
      userName: after.claimantName || "Unknown",
      targetType: "claim",
      targetId: event.params.claimId,
      changes: {
        status: { from: before.status, to: after.status },
        itemId: after.itemId,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log error (claim):", error);
  }
};

module.exports = {
  handleItemCreated,
  handleItemUpdated,
  handleItemDeleted,
  handleClaimProcessed,
};

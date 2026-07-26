const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { handleMatchOnLostItemCreated, handleMatchOnFoundItemCreated } = require("./matching");
const { handleMatchCreated, handleClaimStatusChanged, handleItemReturned } = require("./notifications");
const { handleItemCreated, handleItemUpdated, handleItemDeleted, handleClaimProcessed } = require("./audit");

initializeApp();

// ── MATCHING ─────────────────────────────────────────────────────────────────
exports.onLostItemCreated = onDocumentCreated("lostItems/{itemId}", async (event) => {
  await handleMatchOnLostItemCreated(event, getFirestore());
});

exports.onFoundItemCreated = onDocumentCreated("foundItems/{itemId}", async (event) => {
  await handleMatchOnFoundItemCreated(event, getFirestore());
});

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
exports.onMatchCreated = onDocumentCreated("matches/{matchId}", async (event) => {
  await handleMatchCreated(event, getFirestore(), getMessaging());
});

exports.onClaimStatusChanged = onDocumentUpdated("claims/{claimId}", async (event) => {
  await handleClaimStatusChanged(event, getFirestore(), getMessaging());
});

exports.onItemReturned = onDocumentUpdated("lostItems/{itemId}", async (event) => {
  await handleItemReturned(event, getFirestore(), getMessaging());
});

exports.onFoundItemReturned = onDocumentUpdated("foundItems/{itemId}", async (event) => {
  await handleItemReturned(event, getFirestore(), getMessaging());
});

// ── AUDIT LOGS ───────────────────────────────────────────────────────────────
exports.onLostItemAudit = onDocumentCreated("lostItems/{itemId}", async (event) => {
  await handleItemCreated(event, getFirestore(), "lostItems");
});

exports.onFoundItemAudit = onDocumentCreated("foundItems/{itemId}", async (event) => {
  await handleItemCreated(event, getFirestore(), "foundItems");
});

exports.onLostItemUpdated = onDocumentUpdated("lostItems/{itemId}", async (event) => {
  await handleItemUpdated(event, getFirestore(), "lostItems");
});

exports.onFoundItemUpdated = onDocumentUpdated("foundItems/{itemId}", async (event) => {
  await handleItemUpdated(event, getFirestore(), "foundItems");
});

exports.onLostItemDeleted = onDocumentDeleted("lostItems/{itemId}", async (event) => {
  await handleItemDeleted(event, getFirestore(), "lostItems");
});

exports.onFoundItemDeleted = onDocumentDeleted("foundItems/{itemId}", async (event) => {
  await handleItemDeleted(event, getFirestore(), "foundItems");
});

exports.onClaimProcessed = onDocumentUpdated("claims/{claimId}", async (event) => {
  await handleClaimProcessed(event, getFirestore());
});

/**
 * Auto-matching Cloud Functions
 * Runs server-side when new lost/found items are created
 */

const tokenize = (text = "") =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);

const stopWords = new Set([
  "the", "and", "was", "were", "have", "has", "had", "been", "with",
  "from", "this", "that", "they", "their", "there", "when", "where",
  "which", "what", "found", "lost", "item", "please", "contact",
]);

const cleanTokens = (text) => tokenize(text).filter((w) => !stopWords.has(w));

const jaccard = (setA, setB) => {
  if (!setA.size || !setB.size) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

const computeMatchScore = (itemA, itemB) => {
  if (itemA.type === itemB.type) return 0;
  if (itemA.status === "resolved" || itemB.status === "resolved") return 0;

  const textA = `${itemA.title} ${itemA.description}`;
  const textB = `${itemB.title} ${itemB.description}`;

  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));

  let score = jaccard(tokensA, tokensB) * 60;
  if (itemA.category && itemA.category === itemB.category) score += 25;
  if (itemA.location && itemA.location === itemB.location) score += 15;

  const titleA = new Set(cleanTokens(itemA.title));
  const titleB = new Set(cleanTokens(itemB.title));
  score += jaccard(titleA, titleB) * 20;

  return Math.min(Math.round(score), 100);
};

const handleMatchOnLostItemCreated = async (event, db) => {
  const lostItem = event.data?.data();
  if (!lostItem) return;

  const lostItemId = event.params.itemId;
  console.log(`Running match for new lost item: ${lostItemId}`);

  try {
    // Query foundItems with same category for efficiency
    let foundQuery = db.collection("foundItems")
      .where("status", "==", "open");

    if (lostItem.category) {
      foundQuery = foundQuery.where("category", "==", lostItem.category);
    }

    const foundSnap = await foundQuery.get();
    const matches = [];

    for (const doc of foundSnap.docs) {
      const foundItem = { id: doc.id, ...doc.data() };
      const score = computeMatchScore(lostItem, foundItem);

      if (score >= 25) {
        matches.push({
          lostItemId,
          foundItemId: doc.id,
          lostItemTitle: lostItem.title,
          foundItemTitle: foundItem.title,
          matchScore: score,
          confidence: score >= 75 ? "high" : score >= 55 ? "medium" : "low",
          status: "pending",
          createdAt: new Date(),
        });
      }
    }

    // Save matches
    for (const match of matches) {
      await db.collection("matches").add(match);
      console.log(`Match created: ${match.lostItemId} <-> ${match.foundItemId} (score: ${match.matchScore})`);
    }

    console.log(`Found ${matches.length} matches for lost item ${lostItemId}`);
  } catch (error) {
    console.error("Error matching lost item:", error);
  }
};

const handleMatchOnFoundItemCreated = async (event, db) => {
  const foundItem = event.data?.data();
  if (!foundItem) return;

  const foundItemId = event.params.itemId;
  console.log(`Running match for new found item: ${foundItemId}`);

  try {
    let lostQuery = db.collection("lostItems")
      .where("status", "==", "open");

    if (foundItem.category) {
      lostQuery = lostQuery.where("category", "==", foundItem.category);
    }

    const lostSnap = await lostQuery.get();
    const matches = [];

    for (const doc of lostSnap.docs) {
      const lostItem = { id: doc.id, ...doc.data() };
      const score = computeMatchScore(lostItem, foundItem);

      if (score >= 25) {
        matches.push({
          lostItemId: doc.id,
          foundItemId,
          lostItemTitle: lostItem.title,
          foundItemTitle: foundItem.title,
          matchScore: score,
          confidence: score >= 75 ? "high" : score >= 55 ? "medium" : "low",
          status: "pending",
          createdAt: new Date(),
        });
      }
    }

    for (const match of matches) {
      await db.collection("matches").add(match);
      console.log(`Match created: ${match.lostItemId} <-> ${match.foundItemId} (score: ${match.matchScore})`);
    }

    console.log(`Found ${matches.length} matches for found item ${foundItemId}`);
  } catch (error) {
    console.error("Error matching found item:", error);
  }
};

module.exports = {
  handleMatchOnLostItemCreated,
  handleMatchOnFoundItemCreated,
};

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
  if (itemA.status === "closed" || itemB.status === "closed") return 0;

  const textA = `${itemA.title} ${itemA.description}`;
  const textB = `${itemB.title} ${itemB.description}`;

  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));

  // Base text similarity (0-40)
  let score = jaccard(tokensA, tokensB) * 40;

  // Category match (0-25)
  if (itemA.category && itemA.category === itemB.category) score += 25;

  // Location match (0-15)
  if (itemA.location && itemA.location === itemB.location) score += 15;

  // Brand matching (0-15)
  if (itemA.brand && itemB.brand && itemA.brand.toLowerCase() === itemB.brand.toLowerCase()) {
    score += 15;
  }

  // Color matching (0-10)
  if (itemA.color && itemB.color) {
    const colorA = itemA.color.toLowerCase();
    const colorB = itemB.color.toLowerCase();
    if (colorA === colorB) score += 10;
    else {
      const colorPairs = {
        "black": ["dark", "charcoal"],
        "white": ["light", "cream"],
        "blue": ["navy", "sky", "light blue", "dark blue"],
        "red": ["maroon", "crimson", "burgundy"],
        "green": ["olive", "forest", "lime", "emerald"],
        "brown": ["tan", "beige", "chocolate"],
      };
      for (const [main, variants] of Object.entries(colorPairs)) {
        if ((colorA === main || variants.includes(colorA)) && (colorB === main || variants.includes(colorB))) {
          score += 5;
          break;
        }
      }
    }
  }

  // Title word overlap (0-20)
  const titleA = new Set(cleanTokens(itemA.title || ""));
  const titleB = new Set(cleanTokens(itemB.title || ""));
  score += jaccard(titleA, titleB) * 20;

  // Date proximity bonus (0-10)
  if (itemA.date && itemB.date) {
    try {
      const dateA = new Date(itemA.date);
      const dateB = new Date(itemB.date);
      const diffDays = Math.abs((dateA - dateB) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) score += 10;
      else if (diffDays <= 3) score += 7;
      else if (diffDays <= 7) score += 4;
      else if (diffDays <= 14) score += 2;
    } catch {}
  }

  // Unique marks bonus (0-5)
  if (itemA.uniqueMarks && itemB.uniqueMarks) {
    const marksA = new Set(cleanTokens(itemA.uniqueMarks));
    const marksB = new Set(cleanTokens(itemB.uniqueMarks));
    if (jaccard(marksA, marksB) > 0.2) score += 5;
  }

  return Math.min(Math.round(score), 100);
};

const handleMatchOnLostItemCreated = async (event, db) => {
  const lostItem = event.data?.data();
  if (!lostItem) return;

  const lostItemId = event.params.itemId;
  console.log(`Running match for new lost item: ${lostItemId}`);

  try {
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

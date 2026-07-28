/**
 * TracePoint AI Matching Engine
 * Computes similarity between lost & found items using
 * weighted token overlap + category/location/brand/color bonuses
 */

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

const stopWords = new Set([
  "the", "and", "was", "were", "have", "has", "had", "been", "with",
  "from", "this", "that", "they", "their", "there", "when", "where",
  "which", "what", "found", "lost", "item", "please", "contact",
]);

const cleanTokens = (text) =>
  tokenize(text).filter((w) => !stopWords.has(w));

/** Jaccard similarity on token sets */
const jaccard = (setA, setB) => {
  if (!setA.size || !setB.size) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Compute match score (0–100) between two items
 */
export const computeMatchScore = (itemA, itemB) => {
  if (itemA.type === itemB.type) return 0;
  if (itemA.status === "resolved" || itemB.status === "resolved") return 0;

  const textA = `${itemA.title} ${itemA.description}`;
  const textB = `${itemB.title} ${itemB.description}`;

  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));

  // Base text similarity (0-40)
  let score = jaccard(tokensA, tokensB) * 40;

  // Category bonus (0-25)
  if (itemA.category && itemA.category === itemB.category) score += 25;

  // Location bonus (0-15)
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

  // Title word overlap bonus (0-20)
  const titleA = new Set(cleanTokens(itemA.title));
  const titleB = new Set(cleanTokens(itemB.title));
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

  return Math.min(Math.round(score), 100);
};

/**
 * Find top matches for a given item from a list
 */
export const findMatches = (item, allItems, minScore = 20, maxResults = 5) => {
  return allItems
    .map((other) => ({
      item: other,
      score: computeMatchScore(item, other),
    }))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

/** Label for score */
export const matchLabel = (score) => {
  if (score >= 75) return { label: "Excellent match", color: "emerald" };
  if (score >= 55) return { label: "Good match", color: "blue" };
  if (score >= 35) return { label: "Possible match", color: "yellow" };
  return { label: "Low match", color: "gray" };
};

/** Detect duplicates — same type + high similarity */
export const findDuplicates = (item, allItems, threshold = 65) => {
  return allItems
    .filter((other) => other.id !== item.id && other.type === item.type)
    .map((other) => {
      const textA = `${item.title} ${item.description}`;
      const textB = `${other.title} ${other.description}`;
      const tokensA = new Set(cleanTokens(textA));
      const tokensB = new Set(cleanTokens(textB));
      let score = jaccard(tokensA, tokensB) * 70;
      if (item.category === other.category) score += 20;
      if (item.location === other.location) score += 10;
      return { item: other, score: Math.round(score) };
    })
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
};

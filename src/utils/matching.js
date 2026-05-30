/**
 * TracePoint AI Matching Engine
 * Computes similarity between lost & found items using
 * weighted token overlap + category/location bonuses
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
  // Only match lost vs found
  if (itemA.type === itemB.type) return 0;
  if (itemA.status === "resolved" || itemB.status === "resolved") return 0;

  const textA = `${itemA.title} ${itemA.description}`;
  const textB = `${itemB.title} ${itemB.description}`;

  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));

  let score = jaccard(tokensA, tokensB) * 60;

  // Category bonus
  if (itemA.category && itemA.category === itemB.category) score += 25;

  // Location bonus
  if (itemA.location && itemA.location === itemB.location) score += 15;

  // Title word overlap bonus
  const titleA = new Set(cleanTokens(itemA.title));
  const titleB = new Set(cleanTokens(itemB.title));
  score += jaccard(titleA, titleB) * 20;

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
      const score =
        jaccard(tokensA, tokensB) * 70 +
        (item.category === other.category ? 20 : 0) +
        (item.location === other.location ? 10 : 0);
      return { item: other, score: Math.round(score) };
    })
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
};

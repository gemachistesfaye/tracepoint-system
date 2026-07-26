import { format, formatDistanceToNow } from "date-fns";

export const CATEGORIES = [
  "Electronics",
  "Books & Documents",
  "Clothing & Accessories",
  "Bags & Wallets",
  "Keys",
  "ID & Cards",
  "Jewelry",
  "Sports Equipment",
  "Other",
];

export const LOCATIONS = [
  "Main University Gate",
  "Administration Building",
  "Main Library",
  "Student Cafeteria",
  "College of Computing",
  "College of Agriculture",
  "Health Center",
  "Post Office",
  "Parking Area",
  "Dormitory Area",
  "University Stadium",
  "University Academy",
  "Research Farm 1",
  "Research Farm 2",
  "Sumeya Mosque",
  "Haramaya Lake",
  "HIT Main Building",
  "HIT Library",
  "HIT Laboratory",
  "HIT Cafeteria",
  "HIT Dormitory",
  "HIT Gate",
  "Veterinary Faculty",
  "Veterinary Clinic",
  "Veterinary Laboratory",
  "Veterinary Dormitory",
  "Veterinary Gate",
];

export const STATUS_COLORS = {
  open: "bg-emerald-50 text-emerald-700",
  claimed: "bg-amber-50 text-amber-700",
  resolved: "bg-gray-100 text-gray-500",
};

export const STATUS_LABELS = {
  open: "Open",
  claimed: "Claim Pending",
  resolved: "Resolved",
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, "MMM dd, yyyy");
};

export const timeAgo = (timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
};

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      );
  return dp[m][n];
};

export const searchItems = (items, query) => {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) => {
    const haystack = [
      item.title, item.description, item.category, item.location,
    ].filter(Boolean).join(" ").toLowerCase();
    if (haystack.includes(q)) return true;
    const words = q.split(/\s+/);
    return words.every(word => {
      if (haystack.includes(word)) return true;
      const itemWords = haystack.split(/\s+/);
      return itemWords.some(iw => levenshtein(iw, word) <= Math.max(1, Math.floor(word.length * 0.35)));
    });
  });
};

export const sortItems = (items, sortBy) => {
  const sorted = [...items];
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return db - da;
      });
    case "oldest":
      return sorted.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return da - db;
      });
    case "title":
      return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    default:
      return sorted;
  }
};

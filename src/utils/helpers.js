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
  active: "bg-emerald-50 text-emerald-700",
  matched: "bg-blue-50 text-blue-700",
  claimed: "bg-amber-50 text-amber-700",
  resolved: "bg-gray-100 text-gray-500",
  returned: "bg-gray-100 text-gray-500",
  closed: "bg-gray-100 text-gray-500",
};

export const STATUS_LABELS = {
  open: "Open",
  active: "Active",
  matched: "Matched",
  claimed: "Claim Pending",
  resolved: "Resolved",
  returned: "Returned",
  closed: "Closed",
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "\u2014";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, "MMM dd, yyyy");
};

export const timeAgo = (timestamp) => {
  if (!timestamp) return "\u2014";
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
      item.title, item.description, item.category, item.location, item.brand, item.color,
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

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const generateThumbnail = (file, maxWidth = 400, quality = 0.75) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], `thumb_${file.name}`, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

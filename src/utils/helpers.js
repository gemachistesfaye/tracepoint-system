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
  "Main Library",
  "Science Block",
  "Engineering Block",
  "Agriculture Block",
  "Student Cafeteria",
  "Administration Building",
  "Sports Complex",
  "Dormitory Area",
  "Main Gate",
  "Parking Area",
  "Medical Faculty",
  "Veterinary Faculty",
  "Other",
];

export const STATUS_COLORS = {
  open: "bg-green-100 text-green-700",
  claimed: "bg-yellow-100 text-yellow-700",
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

export const searchItems = (items, query) => {
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
  );
};

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
  // Main Campus
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
  // HIT Campus
  "HIT Main Building",
  "HIT Library",
  "HIT Laboratory",
  "HIT Cafeteria",
  "HIT Dormitory",
  "HIT Gate",
  // Veterinary Campus
  "Veterinary Faculty",
  "Veterinary Clinic",
  "Veterinary Laboratory",
  "Veterinary Dormitory",
  "Veterinary Gate",
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

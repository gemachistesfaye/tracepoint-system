import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllItems, getAllClaims } from "../firebase/firestore";
import ItemCard from "../components/items/ItemCard";
import { formatDate, STATUS_COLORS, STATUS_LABELS } from "../utils/helpers";
import { Loader2, Package, FileText } from "lucide-react";

const MyItems = () => {
  const { currentUser } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reports");

  useEffect(() => {
    const load = async () => {
      const [items, claims] = await Promise.all([
        getAllItems(),
        getAllClaims({ claimantId: currentUser.uid }),
      ]);
      setMyItems(items.filter((i) => i.reportedBy === currentUser.uid));
      setMyClaims(claims);
      setLoading(false);
    };
    load();
  }, [currentUser]);

  const claimStatusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Activity</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {[
          { key: "reports", label: "My Reports", icon: <Package size={15} /> },
          { key: "claims", label: "My Claims", icon: <FileText size={15} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon} {t.label}
            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {t.key === "reports" ? myItems.length : myClaims.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : tab === "reports" ? (
        myItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p>You haven't reported any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myItems.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )
      ) : myClaims.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-20" />
          <p>You haven't submitted any claims yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{claim.itemTitle}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Submitted {formatDate(claim.createdAt)}
                </p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  Proof: {claim.proof}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                  claimStatusColors[claim.status]
                }`}
              >
                {claim.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllItems, getAllClaims } from "../firebase/firestore";
import ItemCard from "../components/items/ItemCard";
import { formatDate } from "../utils/helpers";
import { Loader2, Package, FileText } from "lucide-react";

const MyItems = () => {
  const { currentUser } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reports");

  useEffect(() => {
    const load = async () => {
      const [items, claims] = await Promise.all([getAllItems(), getAllClaims({ claimantId: currentUser.uid })]);
      setMyItems(items.filter(i => i.reportedBy === currentUser.uid));
      setMyClaims(claims);
      setLoading(false);
    };
    load();
  }, [currentUser]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">My Activity</h1>
        <p className="text-gray-500">Your reports and claims</p>
      </div>

      <div className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-2xl w-fit mb-6">
        {[
          { key: "reports", label: "My Reports", icon: <Package size={15} />, count: myItems.length },
          { key: "claims", label: "My Claims", icon: <FileText size={15} />, count: myClaims.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon} {t.label}
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-gray-200 text-gray-600"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-blue-500" /></div>
      ) : tab === "reports" ? (
        myItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-gray-500">No reports yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myItems.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )
      ) : myClaims.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-gray-500">No claims submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myClaims.map(claim => (
            <div key={claim.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="flex-1">
                <p className="font-bold text-gray-900">{claim.itemTitle}</p>
                <p className="text-sm text-gray-500 mt-0.5">Submitted {formatDate(claim.createdAt)}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">Proof: {claim.proof}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize border ${
                claim.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200"
                : claim.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
              }`}>{claim.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyItems;

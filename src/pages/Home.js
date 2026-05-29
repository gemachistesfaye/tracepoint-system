import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/items/ItemCard";
import { Search, PlusCircle, CheckCircle, Bell, Shield, ArrowRight } from "lucide-react";

const Home = () => {
  const { currentUser } = useAuth();
  const { items, lostItems, foundItems, loading } = useItems();

  const recentItems = [...items].slice(0, 6);

  const stats = [
    { label: "Total Reports", value: items.length, color: "text-blue-600" },
    { label: "Lost Items", value: lostItems.length, color: "text-red-500" },
    { label: "Found Items", value: foundItems.length, color: "text-emerald-500" },
    {
      label: "Resolved",
      value: items.filter((i) => i.status === "resolved").length,
      color: "text-purple-500",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Haramaya University
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Lost something on campus? <br />
            <span className="text-blue-200">We'll help you find it.</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto mb-8">
            TracePoint connects the Haramaya University community to report, search, and
            recover lost items quickly and easily.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Search size={18} /> Search Items
            </Link>
            <Link
              to={currentUser ? "/report" : "/register"}
              className="inline-flex items-center gap-2 bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-400 transition-colors border border-blue-400"
            >
              <PlusCircle size={18} /> Report an Item
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
          {stats.map((s) => (
            <div key={s.label} className="p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How TracePoint Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: <PlusCircle size={28} className="text-blue-600" />,
              title: "Report",
              desc: "Submit a lost or found item report with photo, location, and description.",
            },
            {
              icon: <Search size={28} className="text-emerald-600" />,
              title: "Search",
              desc: "Browse items by category, location, or keyword to find your belongings.",
            },
            {
              icon: <CheckCircle size={28} className="text-purple-600" />,
              title: "Claim & Recover",
              desc: "Submit a claim with proof of ownership and get reunited with your item.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-xl mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
          <Link
            to="/search"
            className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p>No items reported yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      {!currentUser && (
        <section className="bg-blue-600 text-white py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Join the TracePoint Community</h2>
            <p className="text-blue-100 mb-6">
              Register with your Haramaya University account to report items, receive
              notifications, and help others recover their belongings.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

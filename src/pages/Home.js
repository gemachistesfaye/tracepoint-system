import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/items/ItemCard";
import {
  Search, PlusCircle, CheckCircle, ArrowRight,
  MapPin, Shield, Zap, Clock, Users, TrendingUp,
  ChevronRight, Star, Bell, Eye
} from "lucide-react";

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
  const { currentUser } = useAuth();
  const { items, lostItems, foundItems, loading } = useItems();
  const [activeTab, setActiveTab] = useState("recent");
  const resolved = items.filter(i => i.status === "resolved");
  const recentItems = [...items].slice(0, 6);
  const matchedItems = items.filter(i => i.status === "resolved").slice(0, 6);
  const displayItems = activeTab === "recent" ? recentItems : matchedItems;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Haramaya University · Official Campus Platform
            </span>
          </div>

          <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-gray-900">Lost something</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              on campus?
            </span>
          </h1>
          <p className="text-center text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            TracePoint is Haramaya University's smart lost & found infrastructure —
            connecting students, staff, and administrators in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/search" className="group inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:-translate-y-0.5">
              <Search size={18} />
              Search Items
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={currentUser ? "/report" : "/register"} className="group inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold px-8 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
              <PlusCircle size={18} />
              Report an Item
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Items Reported", value: items.length, suffix: "+" },
              { label: "Lost Items", value: lostItems.length, suffix: "" },
              { label: "Found Items", value: foundItems.length, suffix: "" },
              { label: "Resolved", value: resolved.length, suffix: "" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-gray-900">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">How TracePoint Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            {[
              { step: "01", icon: <PlusCircle size={24} />, title: "Report", desc: "Submit a lost or found item with photo, location, category, and description in under 2 minutes.", color: "blue" },
              { step: "02", icon: <Zap size={24} />, title: "Smart Match", desc: "Our matching engine compares reports and suggests possible item matches automatically.", color: "cyan" },
              { step: "03", icon: <CheckCircle size={24} />, title: "Claim & Recover", desc: "Submit proof of ownership, get admin verification, and be reunited with your item.", color: "emerald" },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step} className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
                <div className={`inline-flex p-3 rounded-2xl mb-5 ${color === "blue" ? "bg-blue-50 text-blue-600" : color === "cyan" ? "bg-cyan-50 text-cyan-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {icon}
                </div>
                <div className="absolute top-6 right-6 text-5xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none">{step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Built for the Entire Campus</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Zap size={20} />, title: "AI-Powered Matching", desc: "Automatically compares lost and found reports to surface possible matches.", tag: "Smart", color: "blue" },
              { icon: <Bell size={20} />, title: "Real-time Notifications", desc: "Instant alerts when someone claims your item or a match is found.", tag: "Live", color: "cyan" },
              { icon: <Shield size={20} />, title: "Admin Verification", desc: "University authority reviews all claims before approval for security.", tag: "Secure", color: "emerald" },
              { icon: <MapPin size={20} />, title: "Campus Locations", desc: "Tag items to specific campus buildings and landmarks for easy recovery.", tag: "Precise", color: "orange" },
              { icon: <TrendingUp size={20} />, title: "Analytics Dashboard", desc: "Admins get full insights — recovery rates, hot zones, category trends.", tag: "Insights", color: "purple" },
              { icon: <Eye size={20} />, title: "Activity Timeline", desc: "Every item has a full history log from report to resolution.", tag: "Transparent", color: "pink" },
            ].map(({ icon, title, desc, tag, color }) => {
              const colors = {
                blue: "bg-blue-50 text-blue-600 border-blue-200",
                cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
                orange: "bg-orange-50 text-orange-600 border-orange-200",
                purple: "bg-purple-50 text-purple-600 border-purple-200",
                pink: "bg-pink-50 text-pink-600 border-pink-200",
              };
              return (
                <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors[color]}`}>{tag}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RECENT ITEMS ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-1">Live Feed</p>
              <h2 className="text-2xl font-black text-gray-900">Campus Reports</h2>
            </div>
            <div className="flex items-center gap-2">
              {["recent", "resolved"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {tab === "recent" ? "Recent" : "Resolved"}
                </button>
              ))}
              <Link to="/search" className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium ml-2">
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p>No items yet — be the first to report!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIAL / SUCCESS BANNER ── */}
      <section className="py-20 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-10 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <blockquote className="text-xl font-semibold text-gray-900 mb-4 leading-relaxed">
              "I lost my student ID before final exams. TracePoint matched it with a found report within hours —
              I had it back before my first exam. Incredible."
            </blockquote>
            <p className="text-gray-500 text-sm">— 3rd Year Computer Science Student, Haramaya University</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!currentUser && (
        <section className="py-24 px-4 border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Join 
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> TracePoint</span>
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Register with your Haramaya University credentials and start protecting your belongings today.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/25">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-lg p-1.5"><MapPin size={16} /></div>
            <span className="font-bold text-gray-900">TracePoint</span>
            <span className="text-gray-400 text-sm">· Haramaya University</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 TracePoint. Built for Haramaya University.</p>
          <div className="flex gap-6">
            <Link to="/items/lost" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">Lost Items</Link>
            <Link to="/items/found" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">Found Items</Link>
            <Link to="/search" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">Search</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

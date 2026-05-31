import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Search, PlusCircle, CheckCircle, ArrowRight,
  Zap, Shield, Bell, TrendingUp, Eye, ChevronRight,
  Star, Users, Package, BarChart3,
} from "lucide-react";
import InstallButton from "../components/common/InstallButton";

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon: <Zap size={20} />, title: "AI-Powered Matching", desc: "Smart engine compares lost & found reports and surfaces likely matches automatically.", tag: "Smart", color: "blue" },
    { icon: <Bell size={20} />, title: "Real-time Alerts", desc: "Instant notifications when someone claims your item or a potential match is found.", tag: "Live", color: "cyan" },
    { icon: <Shield size={20} />, title: "Verified Claims", desc: "University authority reviews all ownership claims before approval for security.", tag: "Secure", color: "emerald" },
    { icon: <MapPin size={20} />, title: "Campus Map", desc: "Interactive Haramaya University map for precise item location tagging and browsing.", tag: "Map", color: "orange" },
    { icon: <TrendingUp size={20} />, title: "Analytics", desc: "Recovery rates, hot zones, category trends — full visibility for admins.", tag: "Insights", color: "purple" },
    { icon: <Eye size={20} />, title: "Activity Timeline", desc: "Every item has a complete history from initial report to final resolution.", tag: "Transparent", color: "pink" },
  ];

  const steps = [
    { n: "01", icon: <PlusCircle size={26} />, title: "Report", desc: "Submit a lost or found item with photo, campus location, and description in under 2 minutes.", color: "blue" },
    { n: "02", icon: <Zap size={26} />, title: "AI Matches", desc: "Our smart engine instantly compares your report against all others and surfaces possible matches.", color: "purple" },
    { n: "03", icon: <CheckCircle size={26} />, title: "Claim & Recover", desc: "Submit proof of ownership, get admin verification, and be reunited with your belongings.", color: "emerald" },
  ];

  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/8 shadow-xl" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 group-hover:bg-blue-500 text-white rounded-xl p-1.5 transition-colors">
              <MapPin size={18} />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">TracePoint</span>
              <span className="hidden sm:block text-[10px] text-slate-500 leading-none font-medium tracking-wide uppercase">Haramaya University</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {["Features", "How It Works", "About", "Contact"].map(label => (
              <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <InstallButton />
            <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Official Campus Platform · Haramaya University
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Never lose your<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              belongings again
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TracePoint is Haramaya University's smart lost & found platform —
            AI-powered matching, real-time notifications, and campus-wide coverage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="group inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5">
              <PlusCircle size={18} /> Report an Item
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/search" className="inline-flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 backdrop-blur-sm">
              <Search size={18} /> Search Lost Items
            </Link>
          </div>

          {/* Social proof numbers */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { value: 500, suffix: "+", label: "Students helped" },
              { value: 89, suffix: "%", label: "Recovery rate" },
              { value: 24, suffix: "h", label: "Avg resolution" },
            ].map(s => (
              <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white"><Counter target={s.value} suffix={s.suffix} /></p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-black text-white">How it works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Three simple steps to recover your lost item or return something you found</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, icon, title, desc, color }) => (
              <div key={n} className="relative bg-white/3 border border-white/8 rounded-3xl p-8 hover:border-blue-500/30 hover:bg-white/5 transition-all group">
                <div className={`inline-flex p-3.5 rounded-2xl mb-5 ${colorMap[color].split(" ").slice(0, 2).join(" ")}`}>{icon}</div>
                <div className="absolute top-6 right-6 text-5xl font-black text-white/4 select-none">{n}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-black text-white">Built for the entire campus</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc, tag, color }) => (
              <div key={title} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 hover:bg-white/5 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colorMap[color]}`}>{tag}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPUS MAP PREVIEW ── */}
      <section id="about" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Campus Coverage</p>
              <h2 className="text-4xl font-black text-white mb-4">Every corner of<br />Haramaya University</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                TracePoint covers all major campus buildings and landmarks. Tag the exact location where you lost or found an item using our interactive campus map.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {["Main Library", "Science Block", "Engineering Block", "Cafeteria", "Dormitories", "Sports Complex", "Admin Building", "Main Gate"].map(loc => (
                  <div key={loc} className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    {loc}
                  </div>
                ))}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Explore the Map <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-white/3 border border-white/8 rounded-3xl p-6 h-72 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MapPin size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Interactive map available after sign-in</p>
                <p className="text-xs mt-1">Haramaya University · 9.21°N 42.03°E</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600/15 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-10 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <blockquote className="text-xl font-semibold text-white mb-4 leading-relaxed">
              "I lost my laptop before finals. TracePoint matched it with a found report from the library within 2 hours. I was back studying the same evening."
            </blockquote>
            <p className="text-slate-400 text-sm">— Computer Science student, Haramaya University</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="contact" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-8">
            {[
              { icon: <Users size={20} />, label: "500+ Students", color: "blue" },
              { icon: <Package size={20} />, label: "300+ Items", color: "emerald" },
              { icon: <BarChart3 size={20} />, label: "89% Recovery", color: "purple" },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 text-sm font-medium ${colorMap[s.color].split(" ")[1]}`}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white mb-4">
            Join <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">TracePoint</span> today
          </h2>
          <p className="text-slate-400 mb-8 text-lg">Register with your Haramaya University credentials and start protecting your belongings.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-10 py-4 rounded-2xl transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-lg p-1.5"><MapPin size={16} /></div>
            <span className="font-bold text-white">TracePoint</span>
            <span className="text-slate-500 text-sm">· Haramaya University</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 TracePoint. Built for Haramaya University Campus.</p>
          <div className="flex gap-6">
            <Link to="/search" className="text-slate-500 hover:text-white text-sm transition-colors">Search Items</Link>
            <Link to="/register" className="text-slate-500 hover:text-white text-sm transition-colors">Register</Link>
            <Link to="/login" className="text-slate-500 hover:text-white text-sm transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

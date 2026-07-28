import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Search, PlusCircle, CheckCircle, ArrowRight,
  Zap, Shield, Bell, TrendingUp, Eye, ChevronRight,
  Star, Users, Package, BarChart3, Download,
} from "lucide-react";

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
    { icon: <Zap size={20} />, title: "AI-Powered Matching", desc: "Smart engine compares lost & found reports and surfaces likely matches automatically.", tag: "Smart", color: "green" },
    { icon: <Bell size={20} />, title: "Real-time Alerts", desc: "Instant notifications when someone claims your item or a potential match is found.", tag: "Live", color: "teal" },
    { icon: <Shield size={20} />, title: "Verified Claims", desc: "University authority reviews all ownership claims before approval for security.", tag: "Secure", color: "emerald" },
    { icon: <MapPin size={20} />, title: "Campus Map", desc: "Interactive Haramaya University map for precise item location tagging and browsing.", tag: "Map", color: "orange" },
    { icon: <TrendingUp size={20} />, title: "Analytics", desc: "Recovery rates, hot zones, category trends — full visibility for admins.", tag: "Insights", color: "purple" },
    { icon: <Eye size={20} />, title: "Activity Timeline", desc: "Every item has a complete history from initial report to final resolution.", tag: "Transparent", color: "pink" },
  ];

  const steps = [
    { n: "01", icon: <PlusCircle size={26} />, title: "Report", desc: "Submit a lost or found item with photo, campus location, and description in under 2 minutes.", color: "green" },
    { n: "02", icon: <Zap size={26} />, title: "AI Matches", desc: "Our smart engine instantly compares your report against all others and surfaces possible matches.", color: "teal" },
    { n: "03", icon: <CheckCircle size={26} />, title: "Claim & Recover", desc: "Submit proof of ownership, get admin verification, and be reunited with your belongings.", color: "emerald" },
  ];

  const colorMap = {
    green: "bg-primary-50 text-primary-600 border border-primary-100",
    teal: "bg-teal-50 text-teal-600 border border-teal-100",
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border border-orange-100",
    purple: "bg-purple-50 text-purple-600 border border-purple-100",
    pink: "bg-pink-50 text-pink-600 border border-pink-100",
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-primary-600 group-hover:bg-primary-700 text-white rounded-xl p-1.5 transition-colors">
              <MapPin size={18} />
            </div>
            <div>
              <span className="font-black text-gray-900 text-lg tracking-tight">HU Lost & Found</span>
              <span className="hidden sm:block text-[10px] text-gray-400 leading-none font-medium tracking-wide uppercase">Haramaya University</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {["Features", "How It Works", "About", "Contact"].map(label => (
              <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/install" className="hidden sm:inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-2 rounded-xl transition-all text-sm font-medium">
              <Download size={15} /> Install
            </Link>
            <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-gray-500 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary-600/25">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-b from-primary-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(46,125,50,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(46,125,50,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
            Official Campus Platform &middot; Haramaya University
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-gray-900">
            Lost Something on Campus?
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent">
              We'll Help You Find It.
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The official Haramaya University Lost & Found platform connecting students and staff with their belongings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="group inline-flex items-center justify-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary-600/25 hover:-translate-y-0.5">
              <PlusCircle size={18} /> Report Lost Item
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/search" className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5">
              <Search size={18} /> Browse Found Items
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: 320, suffix: "+", label: "Items Returned" },
              { value: 150, suffix: "", label: "Active Cases" },
              { value: 91, suffix: "%", label: "Return Rate" },
              { value: 10, suffix: "", label: "University Colleges" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-gray-900"><Counter target={s.value} suffix={s.suffix} /></p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-black text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Three simple steps to recover your lost item or return something you found</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, icon, title, desc, color }) => (
              <div key={n} className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-primary-300 hover:shadow-card-hover transition-all group">
                <div className={`inline-flex p-3.5 rounded-2xl mb-5 ${colorMap[color].split(" ").slice(0, 2).join(" ")}`}>{icon}</div>
                <div className="absolute top-6 right-6 text-5xl font-black text-gray-100 select-none">{n}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-black text-gray-900">Built for the entire campus</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc, tag, color }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-card-hover transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorMap[color]}`}>{tag}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPUS MAP PREVIEW */}
      <section id="about" className="py-20 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-3">Campus Coverage</p>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Every corner of<br />Haramaya University</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                HU Lost & Found covers all major campus buildings and landmarks. Tag the exact location where you lost or found an item using our interactive campus map.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {["Main Library", "Science Block", "Engineering Block", "Cafeteria", "Dormitories", "Sports Complex", "Admin Building", "Main Gate"].map(loc => (
                  <div key={loc} className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    {loc}
                  </div>
                ))}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Explore the Map <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 h-72 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Interactive map available after sign-in</p>
                <p className="text-xs mt-1">Haramaya University &middot; 9.21&deg;N 42.03&deg;E</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl font-black text-gray-900">Trusted by students & staff</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Student", dept: "Computer Science", quote: "I lost my laptop before finals. The system matched it with a found report from the library within 2 hours. I was back studying the same evening.", role: "Student" },
              { name: "Staff Member", dept: "Administration", quote: "As a department head, I appreciate how easy it is to manage lost items. The admin dashboard gives full visibility into all reports.", role: "Staff" },
              { name: "Security Office", dept: "Campus Security", quote: "We handle dozens of found items daily. This system helps us track, store, and return items efficiently with QR codes and audit logs.", role: "Security" },
            ].map(t => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-card-hover transition-all">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <blockquote className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.quote}"</blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.dept}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-black text-gray-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "How do I report a lost item?", a: "Click 'Report Lost Item' on the homepage, fill in the details including category, location, and description, and submit. You'll be notified if a match is found." },
              { q: "How does the matching system work?", a: "Our AI-powered engine compares your lost report with all found reports using text similarity, category, and location to surface the most likely matches." },
              { q: "What happens after I claim an item?", a: "Your claim is reviewed by the university admin. You'll need to provide proof of ownership. Once approved, you can collect the item from the designated storage location." },
              { q: "Is my personal information safe?", a: "Yes. Only authorized university staff can view your contact details. All data is encrypted and stored securely on Firebase." },
            ].map((faq, i) => (
              <details key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  {faq.q}
                  <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="py-24 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-8">
            {[
              { icon: <Users size={20} />, label: "500+ Students", color: "green" },
              { icon: <Package size={20} />, label: "300+ Items", color: "emerald" },
              { icon: <BarChart3 size={20} />, label: "91% Recovery", color: "teal" },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 text-sm font-medium ${colorMap[s.color].split(" ")[1]}`}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Join <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">HU Lost & Found</span> today
          </h2>
          <p className="text-gray-500 mb-8 text-lg">Register with your Haramaya University credentials and start protecting your belongings.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary-600/25">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-medium px-10 py-4 rounded-2xl transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 text-white rounded-lg p-1.5"><MapPin size={16} /></div>
            <span className="font-bold text-gray-900">HU Lost & Found</span>
            <span className="text-gray-400 text-sm">&middot; Haramaya University</span>
          </div>
          <p className="text-gray-400 text-sm">&copy; 2026 HU Lost & Found. Built for Haramaya University Campus.</p>
          <div className="flex gap-6">
            <Link to="/search" className="text-gray-400 hover:text-primary-600 text-sm transition-colors">Search Items</Link>
            <Link to="/register" className="text-gray-400 hover:text-primary-600 text-sm transition-colors">Register</Link>
            <Link to="/login" className="text-gray-400 hover:text-primary-600 text-sm transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

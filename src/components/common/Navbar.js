import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import {
  MapPin, Menu, X, LogOut, User, Shield,
  PlusCircle, Search, ChevronDown, BarChart3,
  Package, Home, TrendingUp,
} from "lucide-react";

const Navbar = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/home", label: "Dashboard", icon: <Home size={14} /> },
    { to: "/items/lost", label: "Lost Items", icon: <Search size={14} /> },
    { to: "/items/found", label: "Found Items", icon: <Package size={14} /> },
    { to: "/search", label: "Search", icon: <Search size={14} /> },
    { to: "/analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/20"
        : "bg-[#0a0f1e]/80 backdrop-blur-sm border-b border-white/5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={currentUser ? "/home" : "/"} className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 group-hover:bg-blue-500 text-white rounded-xl p-1.5 transition-colors shadow-lg shadow-blue-600/20">
              <MapPin size={18} />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">TracePoint</span>
              <span className="hidden sm:block text-[10px] text-slate-500 leading-none font-medium tracking-widest uppercase">
                Haramaya University
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <>
                <NotificationBell />

                <Link to="/report"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">
                  <PlusCircle size={15} /> Report
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-2 rounded-xl transition-colors">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">
                      {userProfile?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white max-w-[90px] truncate">
                      {userProfile?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden">
                        <div className="p-3 border-b border-white/8">
                          <p className="font-semibold text-sm text-white truncate">{userProfile?.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{userProfile?.email}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                            isAdmin ? "bg-blue-500/20 text-blue-400" : "bg-white/8 text-slate-400"
                          }`}>{isAdmin ? "⚡ Admin" : "Student"}</span>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {[
                            { to: "/home", icon: <Home size={14} />, label: "Dashboard" },
                            { to: "/profile", icon: <User size={14} />, label: "My Profile" },
                            { to: "/my-items", icon: <Package size={14} />, label: "My Items & Claims" },
                            { to: "/analytics", icon: <BarChart3 size={14} />, label: "Analytics" },
                            ...(isAdmin ? [{ to: "/admin", icon: <Shield size={14} />, label: "Admin Panel", admin: true }] : []),
                          ].map(item => (
                            <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                item.admin
                                  ? "text-blue-400 hover:bg-blue-500/10"
                                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}>
                              {item.icon} {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-white/5 pt-1 mt-1">
                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                              <LogOut size={14} /> Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all hidden sm:block">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a0f1e]/98 backdrop-blur-xl border-t border-white/8 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to) ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              {link.icon} {link.label}
            </Link>
          ))}
          {currentUser ? (
            <>
              <Link to="/report" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-blue-400 hover:bg-blue-500/10 transition-colors">
                <PlusCircle size={16} /> Report Item
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/register" className="flex items-center justify-center py-3 bg-blue-600 text-white font-bold rounded-xl text-sm">
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

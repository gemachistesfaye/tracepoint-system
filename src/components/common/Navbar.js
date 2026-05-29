import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import {
  MapPin, Menu, X, LogOut, User, Shield,
  PlusCircle, Search, ChevronDown, BarChart3, Package
} from "lucide-react";

const Navbar = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/items/lost", label: "Lost Items" },
    { to: "/items/found", label: "Found Items" },
    { to: "/search", label: "Search" },
  ];

  const isHomePage = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isHomePage
        ? "bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/20"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 group-hover:bg-blue-500 text-white rounded-xl p-1.5 transition-colors">
              <MapPin size={18} />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">TracePoint</span>
              <span className="hidden sm:block text-[10px] text-slate-500 leading-none font-medium tracking-wide uppercase">
                Haramaya University
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <NotificationBell />

                {/* Report Button */}
                <Link to="/report" className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">
                  <PlusCircle size={15} /> Report Item
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {userProfile?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">
                      {userProfile?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden">
                        <div className="p-3 border-b border-white/8">
                          <p className="font-semibold text-sm text-white truncate">{userProfile?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{userProfile?.email}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                            isAdmin ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-slate-400"
                          }`}>
                            {isAdmin ? "Admin" : "Student"}
                          </span>
                        </div>
                        <div className="p-1.5">
                          {[
                            { to: "/profile", icon: <User size={14} />, label: "My Profile" },
                            { to: "/my-items", icon: <Package size={14} />, label: "My Items & Claims" },
                            ...(isAdmin ? [{ to: "/admin", icon: <BarChart3 size={14} />, label: "Admin Dashboard", admin: true }] : []),
                          ].map(item => (
                            <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                item.admin ? "text-blue-400 hover:bg-blue-500/10" : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}>
                              {item.icon} {item.label}
                            </Link>
                          ))}
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-1 border-t border-white/5 pt-2">
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a0f1e]/98 backdrop-blur-xl border-t border-white/8 px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to) ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              {link.label}
            </Link>
          ))}
          {currentUser && (
            <>
              <Link to="/report" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-blue-400 hover:bg-blue-500/10 transition-colors">
                <PlusCircle size={16} /> Report Item
              </Link>
              <Link to="/my-items" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <Package size={16} /> My Items
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <Shield size={16} /> Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

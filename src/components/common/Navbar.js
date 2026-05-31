import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import InstallButton from "./InstallButton";
import LogoutDialog from "./LogoutDialog";
import {
  MapPin, Menu, X, User, Shield,
  PlusCircle, Search, ChevronDown, BarChart3,
  Package, Home, TrendingUp, Users, FileText, Settings, LogOut,
} from "lucide-react";

const Navbar = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogoutConfirm = async () => {
    await logout();
    setShowLogoutDialog(false);
    navigate("/");
  };

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname === path || location.pathname.startsWith(path + "/");

  const adminLinks = [
    { to: "/admin", label: "Overview", icon: <BarChart3 size={14} />, exact: true },
    { to: "/admin/claims", label: "Claims", icon: <FileText size={14} /> },
    { to: "/admin/items", label: "All Items", icon: <Package size={14} /> },
    { to: "/admin/users", label: "Users", icon: <Users size={14} /> },
    { to: "/analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
  ];

  const userLinks = [
    { to: "/home", label: "Dashboard", icon: <Home size={14} /> },
    { to: "/items/lost", label: "Lost Items", icon: <Search size={14} /> },
    { to: "/items/found", label: "Found Items", icon: <Package size={14} /> },
    { to: "/search", label: "Search", icon: <Search size={14} /> },
  ];

  const navLinks = isAdmin ? adminLinks : userLinks;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f1e]/98 backdrop-blur-xl border-b border-white/8 shadow-xl"
          : "bg-[#0a0f1e]/80 backdrop-blur-sm border-b border-white/5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={isAdmin ? "/admin" : currentUser ? "/home" : "/"} className="flex items-center gap-2.5 group">
              <div className={`text-white rounded-xl p-1.5 transition-all shadow-lg group-hover:-translate-y-0.5 ${
                isAdmin ? "bg-purple-600 shadow-purple-600/20" : "bg-blue-600 shadow-blue-600/20"
              }`}>
                <MapPin size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-lg tracking-tight">TracePoint</span>
                  {isAdmin && (
                    <span className="text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-[10px] text-slate-500 leading-none font-medium tracking-widest uppercase">
                  Haramaya University
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = isActive(link.to, link.exact);
                return (
                  <Link key={link.to} to={link.to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? isAdmin ? "bg-purple-600/20 text-purple-400" : "bg-blue-600/20 text-blue-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}>
                    {link.icon} {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2.5">
              {currentUser ? (
                <>
                  <NotificationBell />

                  {isAdmin ? (
                    <Link to="/admin/claims"
                      className="hidden sm:inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-600/20">
                      <FileText size={15} /> Review Claims
                    </Link>
                  ) : (
                    <Link to="/report"
                      className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">
                      <PlusCircle size={15} /> Report
                    </Link>
                  )}

                  {/* User dropdown */}
                  <div className="relative">
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-2 rounded-xl transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs ${
                        isAdmin ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}>
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
                        <div className="absolute right-0 mt-2 w-60 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden">
                          <div className={`p-4 border-b border-white/8 ${isAdmin ? "bg-purple-600/10" : "bg-blue-600/5"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${
                                isAdmin ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                              }`}>
                                {userProfile?.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white truncate">{userProfile?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{userProfile?.email}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                                  isAdmin ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                }`}>{isAdmin ? "⚡ Admin" : "Student"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            {isAdmin ? (
                              adminLinks.map(item => (
                                <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                  <span className="text-purple-400">{item.icon}</span> {item.label}
                                </Link>
                              ))
                            ) : (
                              [
                                { to: "/home", icon: <Home size={14} />, label: "Dashboard" },
                                { to: "/profile", icon: <User size={14} />, label: "My Profile" },
                                { to: "/my-items", icon: <Package size={14} />, label: "My Items & Claims" },
                                { to: "/analytics", icon: <TrendingUp size={14} />, label: "Analytics" },
                              ].map(item => (
                                <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                  <span className="text-slate-400">{item.icon}</span> {item.label}
                                </Link>
                              ))
                            )}
                            <div className="border-t border-white/5 pt-1 mt-1">
                              <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                <Settings size={14} className="text-slate-400" /> Account Settings
                              </Link>
                              <button onClick={() => { setUserMenuOpen(false); setShowLogoutDialog(true); }}
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
                  <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all hidden sm:block">Sign In</Link>
                  <Link to="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20">Get Started</Link>
                </div>
              )}

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
            {navLinks.map(link => {
              const active = isActive(link.to, link.exact);
              return (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? isAdmin ? "bg-purple-600/20 text-purple-400" : "bg-blue-600/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {link.icon} {link.label}
                </Link>
              );
            })}
            <div className="border-t border-white/8 pt-2 mt-2 space-y-1">
              {isAdmin ? (
                <Link to="/admin/claims" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-purple-400 hover:bg-purple-500/10 transition-colors">
                  <FileText size={16} /> Review Claims
                </Link>
              ) : (
                <Link to="/report" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <PlusCircle size={16} /> Report Item
                </Link>
              )}
              <button onClick={() => { setMenuOpen(false); setShowLogoutDialog(true); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Logout confirmation */}
      {showLogoutDialog && (
        <LogoutDialog
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutDialog(false)}
        />
      )}
    </>
  );
};

export default Navbar;

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ItemsProvider } from "./context/ItemsContext";
import { ProtectedRoute, AdminRoute } from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ItemsList from "./pages/ItemsList";
import ItemDetail from "./pages/ItemDetail";
import ReportItem from "./pages/ReportItem";
import Search from "./pages/Search";
import MyItems from "./pages/MyItems";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";

// Root: guests → landing, admins → /admin, users → /home
const RootRoute = () => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <LandingPage />;
  if (userProfile?.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-[#0a0f1e]">
    <Navbar />
    <div className="pt-16">{children}</div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ItemsProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { background: "#0f1629", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" },
        }} />
        <Routes>
          {/* Smart root */}
          <Route path="/" element={<RootRoute />} />

          {/* Auth — no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User pages */}
          <Route path="/home" element={<AppLayout><ProtectedRoute><Dashboard /></ProtectedRoute></AppLayout>} />
          <Route path="/items/lost" element={<AppLayout><ItemsList /></AppLayout>} />
          <Route path="/items/found" element={<AppLayout><ItemsList /></AppLayout>} />
          <Route path="/items/:id" element={<AppLayout><ItemDetail /></AppLayout>} />
          <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
          <Route path="/report" element={<AppLayout><ProtectedRoute><ReportItem /></ProtectedRoute></AppLayout>} />
          <Route path="/my-items" element={<AppLayout><ProtectedRoute><MyItems /></ProtectedRoute></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><ProtectedRoute><Analytics /></ProtectedRoute></AppLayout>} />

          {/* Admin only */}
          <Route path="/admin" element={<AppLayout><AdminRoute><AdminDashboard /></AdminRoute></AppLayout>} />
          <Route path="/admin/items" element={<AppLayout><AdminRoute><AdminDashboard tab="items" /></AdminRoute></AppLayout>} />
          <Route path="/admin/claims" element={<AppLayout><AdminRoute><AdminDashboard tab="claims" /></AdminRoute></AppLayout>} />
          <Route path="/admin/users" element={<AppLayout><AdminRoute><AdminDashboard tab="users" /></AdminRoute></AppLayout>} />

          <Route path="*" element={<AppLayout><div className="text-center py-32"><p className="text-6xl font-black text-white/10 mb-4">404</p><p className="text-slate-400">Page not found</p></div></AppLayout>} />
        </Routes>
      </ItemsProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

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

// Smart root: guests see landing, logged-in see dashboard
const RootRoute = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Navigate to="/home" replace /> : <LandingPage />;
};

// Pages that use the app navbar
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f1629",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            },
          }}
        />
        <Routes>
          {/* Public landing — no navbar (has its own) */}
          <Route path="/" element={<RootRoute />} />

          {/* Auth pages — no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* App pages — use AppLayout with Navbar */}
          <Route path="/home" element={<AppLayout><ProtectedRoute><Dashboard /></ProtectedRoute></AppLayout>} />
          <Route path="/items/lost" element={<AppLayout><ItemsList /></AppLayout>} />
          <Route path="/items/found" element={<AppLayout><ItemsList /></AppLayout>} />
          <Route path="/items/:id" element={<AppLayout><ItemDetail /></AppLayout>} />
          <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
          <Route path="/report" element={<AppLayout><ProtectedRoute><ReportItem /></ProtectedRoute></AppLayout>} />
          <Route path="/my-items" element={<AppLayout><ProtectedRoute><MyItems /></ProtectedRoute></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><ProtectedRoute><Analytics /></ProtectedRoute></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminRoute><AdminDashboard /></AdminRoute></AppLayout>} />

          {/* 404 */}
          <Route path="*" element={
            <AppLayout>
              <div className="text-center py-32 text-slate-500">
                <p className="text-6xl font-black mb-4 text-white/10">404</p>
                <p className="text-lg text-slate-400">Page not found</p>
              </div>
            </AppLayout>
          } />
        </Routes>
      </ItemsProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

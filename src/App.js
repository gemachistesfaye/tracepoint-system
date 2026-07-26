import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ItemsProvider } from "./context/ItemsContext";
import { ProtectedRoute, AdminRoute } from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import { AlertTriangle } from "lucide-react";

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
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import Messages from "./pages/Messages";

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-4">An unexpected error occurred. Please try again.</p>
            <button onClick={() => window.location.reload()} className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <p className="text-8xl font-black text-primary-100 mb-4">404</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors inline-block">
        Back to Home
      </Link>
    </div>
  </div>
);

const RootRoute = () => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <LandingPage />;
  if (userProfile?.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="pt-16">{children}</div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <AuthProvider>
        <ItemsProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 3500,
            style: { background: "#1e293b", color: "#fff", borderRadius: "12px", fontSize: "14px" },
          }} />
          <PWAInstallPrompt />
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/home" element={<AppLayout><ProtectedRoute><Dashboard /></ProtectedRoute></AppLayout>} />
            <Route path="/items/lost" element={<AppLayout><ItemsList /></AppLayout>} />
            <Route path="/items/found" element={<AppLayout><ItemsList /></AppLayout>} />
            <Route path="/items/:id" element={<AppLayout><ItemDetail /></AppLayout>} />
            <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
            <Route path="/report" element={<AppLayout><ProtectedRoute><ReportItem /></ProtectedRoute></AppLayout>} />
            <Route path="/my-items" element={<AppLayout><ProtectedRoute><MyItems /></ProtectedRoute></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout>} />
            <Route path="/settings" element={<AppLayout><ProtectedRoute><Settings /></ProtectedRoute></AppLayout>} />
            <Route path="/analytics" element={<AppLayout><ProtectedRoute><Analytics /></ProtectedRoute></AppLayout>} />
            <Route path="/messages" element={<AppLayout><ProtectedRoute><Messages /></ProtectedRoute></AppLayout>} />
            <Route path="/admin" element={<AppLayout><AdminRoute><AdminDashboard /></AdminRoute></AppLayout>} />
            <Route path="/admin/items" element={<AppLayout><AdminRoute><AdminDashboard tab="items" /></AdminRoute></AppLayout>} />
            <Route path="/admin/claims" element={<AppLayout><AdminRoute><AdminDashboard tab="claims" /></AdminRoute></AppLayout>} />
            <Route path="/admin/users" element={<AppLayout><AdminRoute><AdminDashboard tab="users" /></AdminRoute></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ItemsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ItemsProvider } from "./context/ItemsContext";
import { ProtectedRoute, AdminRoute } from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import { AlertTriangle, Home, RefreshCw, Bug } from "lucide-react";
import { logger } from "./utils/logger";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ItemsList = lazy(() => import("./pages/ItemsList"));
const ItemDetail = lazy(() => import("./pages/ItemDetail"));
const ReportItem = lazy(() => import("./pages/ReportItem"));
const Search = lazy(() => import("./pages/Search"));
const MyItems = lazy(() => import("./pages/MyItems"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Messages = lazy(() => import("./pages/Messages"));
const InstallApp = lazy(() => import("./pages/InstallApp"));

const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading page">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development";
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-2">
              The application encountered an unexpected error. Your data is safe.
            </p>
            {isDev && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 mb-2">
                  Error details (dev only)
                </summary>
                <pre className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                <RefreshCw size={14} /> Reload Page
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Home size={14} /> Go Home
              </Link>
            </div>
            <a
              href="mailto:support@tracepoint.app?subject=Error%20Report&body=Please%20describe%20what%20you%20were%20doing..."
              className="inline-flex items-center gap-1.5 mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bug size={12} /> Report this issue
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-sm">
      <div className="relative mb-6">
        <p className="text-[120px] font-black text-primary-100 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary-50 text-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary-100">
            <AlertTriangle size={28} />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 text-sm mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
      >
        <Home size={16} /> Back to Home
      </Link>
    </div>
  </div>
);

const RootRoute = () => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!currentUser) return <LandingPage />;
  if (userProfile?.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold focus:text-sm"
    >
      Skip to main content
    </a>
    <Navbar />
    <main id="main-content" role="main" className="pt-16">
      {children}
    </main>
  </div>
);

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <AuthProvider>
        <ItemsProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { background: "#1e293b", color: "#fff", borderRadius: "12px", fontSize: "14px" },
            }}
          />
          <PWAInstallPrompt />
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/install" element={<InstallApp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ItemsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;

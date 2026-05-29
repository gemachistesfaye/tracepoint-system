import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ItemsProvider } from "./context/ItemsContext";
import { ProtectedRoute, AdminRoute } from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";

import Home from "./pages/Home";
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

const PageWrapper = ({ children, noPad }) => (
  <div className={noPad ? "" : "pt-16"}>{children}</div>
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
        <div className="min-h-screen bg-[#0a0f1e]">
          <Navbar />
          <Routes>
            {/* Home — no extra padding (full bleed hero) */}
            <Route path="/" element={<PageWrapper noPad><Home /></PageWrapper>} />

            {/* Auth pages — no navbar padding needed */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public pages */}
            <Route path="/items/lost" element={<PageWrapper><ItemsList /></PageWrapper>} />
            <Route path="/items/found" element={<PageWrapper><ItemsList /></PageWrapper>} />
            <Route path="/items/:id" element={<PageWrapper><ItemDetail /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />

            {/* Protected */}
            <Route path="/report" element={<ProtectedRoute><PageWrapper><ReportItem /></PageWrapper></ProtectedRoute>} />
            <Route path="/my-items" element={<ProtectedRoute><PageWrapper><MyItems /></PageWrapper></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><PageWrapper><AdminDashboard /></PageWrapper></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <PageWrapper>
                <div className="text-center py-32 text-slate-500">
                  <p className="text-6xl font-black mb-4 text-white/10">404</p>
                  <p className="text-lg">Page not found</p>
                </div>
              </PageWrapper>
            } />
          </Routes>
        </div>
      </ItemsProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

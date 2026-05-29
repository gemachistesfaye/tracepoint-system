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

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ItemsProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/items/lost" element={<ItemsList />} />
            <Route path="/items/found" element={<ItemsList />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/search" element={<Search />} />

            {/* Protected */}
            <Route path="/report" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
            <Route path="/my-items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center py-24 text-gray-400">
                <p className="text-5xl mb-4">404</p>
                <p className="text-lg">Page not found</p>
              </div>
            } />
          </Routes>
        </div>
      </ItemsProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

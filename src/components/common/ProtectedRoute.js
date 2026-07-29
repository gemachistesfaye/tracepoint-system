import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (userProfile && userProfile.role !== "admin") return <Navigate to="/home" replace />;
  return children;
};

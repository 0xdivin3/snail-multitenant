// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  // super_admin goes to their own dashboard, never the farm layout
  if (isSuperAdmin && !superAdminOnly) {
    return <Navigate to="/platform" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) return <Navigate to="/dashboard" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}

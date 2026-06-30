// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import PlatformLayout from "./layouts/PlatformLayout";

// Public pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";

// Farm pages (Admin + Staff)
import Dashboard from "./pages/Dashboard";
import Pens from "./pages/Pens";
import Breeding from "./pages/Breeding";
import Feeding from "./pages/Feeding";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

// Platform pages (super_admin only)
import PlatformOverview from "./pages/platform/PlatformOverview";
import Organizations from "./pages/platform/Organizations";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Farm workspace — Admin & Staff */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pens" element={<Pens />} />
          <Route path="/breeding" element={<Breeding />} />
          <Route path="/feeding" element={<Feeding />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route
            path="/reports"
            element={
              <ProtectedRoute adminOnly>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Platform admin — super_admin only */}
        <Route
          element={
            <ProtectedRoute superAdminOnly>
              <PlatformLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/platform" element={<PlatformOverview />} />
          <Route path="/platform/organizations" element={<Organizations />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

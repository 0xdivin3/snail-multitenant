// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("snail_user");
    const token = localStorage.getItem("snail_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    localStorage.setItem("snail_token", data.token);
    // Fetch full profile to get organization_name
    const profile = await apiClient.get("/auth/me", {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    const enriched = { ...data.user, organization_name: profile.data.organization_name };
    localStorage.setItem("snail_user", JSON.stringify(enriched));
    setUser(enriched);
    return enriched;
  }

  async function signup(payload) {
    const { data } = await apiClient.post("/auth/signup", payload);
    localStorage.setItem("snail_token", data.token);
    const enriched = { ...data.user, organization_name: data.organization?.name };
    localStorage.setItem("snail_user", JSON.stringify(enriched));
    setUser(enriched);
    return enriched;
  }

  function logout() {
    localStorage.removeItem("snail_token");
    localStorage.removeItem("snail_user");
    setUser(null);
  }

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const isTenantUser = isAdmin || isStaff; // belongs to a farm, as opposed to platform-level

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, isSuperAdmin, isAdmin, isStaff, isTenantUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

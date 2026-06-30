// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const STAT_CONFIG = [
  { key: "total_pens", label: "Total Pens", format: (v) => v },
  { key: "total_snails", label: "Total Snail Stock", format: (v) => v.toLocaleString() },
  { key: "active_breeding_batches", label: "Active Breeding Batches", format: (v) => v },
  { key: "feed_given_today_kg", label: "Feed Given Today (kg)", format: (v) => v.toFixed(1) },
  { key: "low_stock_items", label: "Low Stock Items", format: (v) => v, alert: true },
  { key: "revenue_this_month", label: "Revenue This Month (₦)", format: (v) => v.toLocaleString() },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    apiClient
      .get("/reports/dashboard")
      .then(({ data }) => setSummary(data))
      .catch(() => setError("Could not load dashboard summary."));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Welcome back, {user?.full_name?.split(" ")[0]}</h1>
      <p style={{ color: "var(--color-ink-muted)", marginTop: 0, marginBottom: 28 }}>
        Here's what's happening on the farm today.
      </p>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {!summary && !error && <p style={{ color: "var(--color-ink-muted)" }}>Loading summary…</p>}

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {STAT_CONFIG.map((stat) => {
            const value = summary[stat.key];
            const isAlert = stat.alert && value > 0;
            return (
              <div
                key={stat.key}
                className="card"
                style={{
                  padding: "20px 22px",
                  borderLeft: isAlert ? "4px solid var(--color-danger)" : "4px solid var(--color-primary)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: 6 }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 600 }}>
                  {stat.format(value)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

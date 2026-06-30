// src/pages/platform/PlatformOverview.jsx
import { useEffect, useState } from "react";
import apiClient from "../../api/client";

const STAT_CONFIG = [
  { key: "total_organizations", label: "Total Farm Organizations" },
  { key: "active_organizations", label: "Active Organizations" },
  { key: "total_users", label: "Total Users" },
  { key: "total_pens", label: "Pens Across Platform" },
  { key: "total_snails_platform_wide", label: "Total Snails (Platform)" },
  { key: "total_platform_revenue", label: "Total Platform Revenue (₦)", currency: true },
];

export default function PlatformOverview() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/reports/platform/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setError("Could not load platform summary."));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Platform Overview</h1>
      <p style={{ color: "var(--color-ink-muted)", marginTop: 0, marginBottom: 28 }}>
        Aggregate stats across all registered farm organizations.
      </p>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {!summary && !error && <p style={{ color: "var(--color-ink-muted)" }}>Loading…</p>}

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {STAT_CONFIG.map((stat) => (
            <div
              key={stat.key}
              className="card"
              style={{ padding: "20px 22px", borderLeft: "4px solid var(--color-accent)" }}
            >
              <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 600 }}>
                {stat.currency
                  ? `₦${Number(summary[stat.key]).toLocaleString()}`
                  : Number(summary[stat.key]).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

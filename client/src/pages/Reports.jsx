// src/pages/Reports.jsx
import { useState } from "react";
import apiClient from "../api/client";

const REPORT_TYPES = [
  { key: "feeding", label: "Feeding Report" },
  { key: "breeding", label: "Breeding Report" },
  { key: "inventory", label: "Inventory Report" },
  { key: "sales", label: "Sales Report" },
];

export default function Reports() {
  const [activeReport, setActiveReport] = useState("feeding");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (start) params.start = start;
      if (end) params.end = end;
      const { data: result } = await apiClient.get(`/reports/${activeReport}`, { params });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate report.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function renderTable() {
    if (!data || data.length === 0) return <p style={{ color: "var(--color-ink-muted)" }}>No data for this range.</p>;
    const columns = Object.keys(data[0]);
    return (
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c}>{c.replace(/_/g, " ")}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => <td key={c}>{row[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Reports</h1>
      <p style={{ color: "var(--color-ink-muted)", marginTop: 0, marginBottom: 28 }}>
        Generate operational reports across farm activities.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label>Report Type</label>
            <select className="input" value={activeReport} onChange={(e) => setActiveReport(e.target.value)} style={{ minWidth: 200 }}>
              {REPORT_TYPES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label>From</label>
            <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label>To</label>
            <input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {data && (
        <div className="card" style={{ overflow: "hidden" }}>
          {renderTable()}
        </div>
      )}
    </div>
  );
}

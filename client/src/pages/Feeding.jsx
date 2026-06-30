// src/pages/Feeding.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const EMPTY_FORM = { pen_id: "", feed_type: "", quantity_kg: "", feeding_date: "", notes: "" };

export default function Feeding() {
  const [records, setRecords] = useState([]);
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { isAdmin } = useAuth();

  function loadData() {
    setLoading(true);
    Promise.all([apiClient.get("/feeding"), apiClient.get("/pens")])
      .then(([feedingRes, pensRes]) => {
        setRecords(feedingRes.data);
        setPens(pensRes.data);
      })
      .catch(() => setError("Could not load feeding records."))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setForm({ ...EMPTY_FORM, feeding_date: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiClient.post("/feeding", form);
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save feeding record.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this feeding record?")) return;
    try {
      await apiClient.delete(`/feeding/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete record.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Feeding</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Log feed given to each pen.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Log Feeding</button>
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {loading && <p style={{ color: "var(--color-ink-muted)" }}>Loading…</p>}

      {!loading && records.length === 0 && !error && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          No feeding records yet.
        </div>
      )}

      {records.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pen</th>
                <th>Feed Type</th>
                <th>Quantity (kg)</th>
                <th>Recorded By</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.feeding_date?.slice(0, 10)}</td>
                  <td className="mono">{r.pen_code || "—"}</td>
                  <td>{r.feed_type}</td>
                  <td>{r.quantity_kg}</td>
                  <td>{r.recorded_by_name || "—"}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-danger" style={{ padding: "5px 10px" }} onClick={() => handleDelete(r.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Log Feeding" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Pen</label>
              <select className="input" required value={form.pen_id} onChange={(e) => setForm({ ...form, pen_id: e.target.value })}>
                <option value="">— Select pen —</option>
                {pens.map((p) => <option key={p.id} value={p.id}>{p.pen_code}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Feed Type</label>
              <input className="input" required placeholder="e.g. Pawpaw leaves, mash" value={form.feed_type} onChange={(e) => setForm({ ...form, feed_type: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Quantity (kg)</label>
              <input className="input" type="number" step="0.1" min="0" required value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Feeding Date</label>
              <input className="input" type="date" value={form.feeding_date} onChange={(e) => setForm({ ...form, feeding_date: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

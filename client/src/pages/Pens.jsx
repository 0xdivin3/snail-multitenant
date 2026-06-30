// src/pages/Pens.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const EMPTY_FORM = { pen_code: "", location: "", snail_species: "", capacity: "", current_count: "", status: "active" };

export default function Pens() {
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { isAdmin } = useAuth();

  function loadPens() {
    setLoading(true);
    apiClient
      .get("/pens")
      .then(({ data }) => setPens(data))
      .catch(() => setError("Could not load pens."))
      .finally(() => setLoading(false));
  }

  useEffect(loadPens, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(pen) {
    setForm({
      pen_code: pen.pen_code,
      location: pen.location || "",
      snail_species: pen.snail_species || "",
      capacity: pen.capacity ?? "",
      current_count: pen.current_count ?? "",
      status: pen.status,
    });
    setEditingId(pen.id);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/pens/${editingId}`, form);
      } else {
        await apiClient.post("/pens", form);
      }
      setShowModal(false);
      loadPens();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save pen.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this pen? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/pens/${id}`);
      loadPens();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete pen.");
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Pens</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Manage snail pens and beds across the farm.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Pen
          </button>
        )}
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {loading && <p style={{ color: "var(--color-ink-muted)" }}>Loading pens…</p>}

      {!loading && pens.length === 0 && !error && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          No pens recorded yet. {isAdmin && "Add your first pen to get started."}
        </div>
      )}

      {pens.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Pen Code</th>
                <th>Location</th>
                <th>Species</th>
                <th>Capacity</th>
                <th>Current Count</th>
                <th>Status</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {pens.map((pen) => (
                <tr key={pen.id}>
                  <td className="mono">{pen.pen_code}</td>
                  <td>{pen.location || "—"}</td>
                  <td>{pen.snail_species}</td>
                  <td>{pen.capacity ?? "—"}</td>
                  <td>{pen.current_count}</td>
                  <td>
                    <span className={`badge badge-${pen.status}`}>{pen.status}</span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-outline" style={{ marginRight: 8, padding: "5px 10px" }} onClick={() => openEdit(pen)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: "5px 10px" }} onClick={() => handleDelete(pen.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? "Edit Pen" : "Add Pen"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Pen Code</label>
              <input className="input" required value={form.pen_code} onChange={(e) => setForm({ ...form, pen_code: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Snail Species</label>
              <input className="input" placeholder="Archachatina marginata" value={form.snail_species} onChange={(e) => setForm({ ...form, snail_species: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Capacity</label>
                <input className="input" type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Current Count</label>
                <input className="input" type="number" min="0" value={form.current_count} onChange={(e) => setForm({ ...form, current_count: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              {editingId ? "Save Changes" : "Add Pen"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

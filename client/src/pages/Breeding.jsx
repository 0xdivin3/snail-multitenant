// src/pages/Breeding.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const EMPTY_FORM = {
  pen_id: "", batch_code: "", parent_stock_count: "", mating_date: "",
  expected_hatch_date: "", eggs_laid: "", hatchlings_count: "", status: "mating", notes: "",
};

export default function Breeding() {
  const [records, setRecords] = useState([]);
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { isAdmin } = useAuth();

  function loadData() {
    setLoading(true);
    Promise.all([apiClient.get("/breeding"), apiClient.get("/pens")])
      .then(([breedingRes, pensRes]) => {
        setRecords(breedingRes.data);
        setPens(pensRes.data);
      })
      .catch(() => setError("Could not load breeding records."))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(record) {
    setForm({
      pen_id: record.pen_id || "",
      batch_code: record.batch_code,
      parent_stock_count: record.parent_stock_count,
      mating_date: record.mating_date?.slice(0, 10) || "",
      expected_hatch_date: record.expected_hatch_date?.slice(0, 10) || "",
      eggs_laid: record.eggs_laid,
      hatchlings_count: record.hatchlings_count,
      status: record.status,
      notes: record.notes || "",
    });
    setEditingId(record.id);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/breeding/${editingId}`, form);
      } else {
        await apiClient.post("/breeding", form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save breeding record.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this breeding record?")) return;
    try {
      await apiClient.delete(`/breeding/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete record.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Breeding</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Track mating, incubation, and hatching batches.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Batch</button>
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {loading && <p style={{ color: "var(--color-ink-muted)" }}>Loading…</p>}

      {!loading && records.length === 0 && !error && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          No breeding batches recorded yet.
        </div>
      )}

      {records.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Pen</th>
                <th>Parent Stock</th>
                <th>Mating Date</th>
                <th>Eggs Laid</th>
                <th>Hatchlings</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.batch_code}</td>
                  <td>{r.pen_code || "—"}</td>
                  <td>{r.parent_stock_count}</td>
                  <td>{r.mating_date?.slice(0, 10) || "—"}</td>
                  <td>{r.eggs_laid}</td>
                  <td>{r.hatchlings_count}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td>
                    <button className="btn btn-outline" style={{ marginRight: 8, padding: "5px 10px" }} onClick={() => openEdit(r)}>Edit</button>
                    {isAdmin && (
                      <button className="btn btn-danger" style={{ padding: "5px 10px" }} onClick={() => handleDelete(r.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? "Edit Batch" : "New Breeding Batch"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Batch Code</label>
              <input className="input" required value={form.batch_code} onChange={(e) => setForm({ ...form, batch_code: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Pen</label>
              <select className="input" value={form.pen_id} onChange={(e) => setForm({ ...form, pen_id: e.target.value })}>
                <option value="">— Select pen —</option>
                {pens.map((p) => <option key={p.id} value={p.id}>{p.pen_code}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Parent Stock Count</label>
              <input className="input" type="number" required min="0" value={form.parent_stock_count} onChange={(e) => setForm({ ...form, parent_stock_count: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Mating Date</label>
                <input className="input" type="date" value={form.mating_date} onChange={(e) => setForm({ ...form, mating_date: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Expected Hatch Date</label>
                <input className="input" type="date" value={form.expected_hatch_date} onChange={(e) => setForm({ ...form, expected_hatch_date: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Eggs Laid</label>
                <input className="input" type="number" min="0" value={form.eggs_laid} onChange={(e) => setForm({ ...form, eggs_laid: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Hatchlings</label>
                <input className="input" type="number" min="0" value={form.hatchlings_count} onChange={(e) => setForm({ ...form, hatchlings_count: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="mating">Mating</option>
                <option value="incubating">Incubating</option>
                <option value="hatched">Hatched</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              {editingId ? "Save Changes" : "Create Batch"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// src/pages/Sales.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const EMPTY_FORM = {
  buyer_name: "", buyer_contact: "", item_sold: "live snail",
  quantity_sold: "", unit_price: "", sale_date: "", pen_id: "", notes: "",
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [pens, setPens] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { isAdmin } = useAuth();

  function loadData() {
    setLoading(true);
    Promise.all([apiClient.get("/sales"), apiClient.get("/pens"), apiClient.get("/sales/summary")])
      .then(([salesRes, pensRes, summaryRes]) => {
        setSales(salesRes.data);
        setPens(pensRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => setError("Could not load sales records."))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setForm({ ...EMPTY_FORM, sale_date: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiClient.post("/sales", form);
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record sale.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this sale record?")) return;
    try {
      await apiClient.delete(`/sales/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete sale.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Sales</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Record sales of snails and farm produce.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Record Sale</button>
      </div>

      {summary && (
        <div style={{ display: "flex", gap: 18, marginBottom: 24 }}>
          <div className="card" style={{ padding: "16px 22px", flex: 1 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>Total Transactions</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>{summary.total_transactions}</div>
          </div>
          <div className="card" style={{ padding: "16px 22px", flex: 1 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>Total Quantity Sold</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>{summary.total_quantity_sold}</div>
          </div>
          <div className="card" style={{ padding: "16px 22px", flex: 1 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>Total Revenue</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>₦{Number(summary.total_revenue).toLocaleString()}</div>
          </div>
        </div>
      )}

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {loading && <p style={{ color: "var(--color-ink-muted)" }}>Loading…</p>}

      {!loading && sales.length === 0 && !error && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          No sales recorded yet.
        </div>
      )}

      {sales.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Buyer</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.sale_date?.slice(0, 10)}</td>
                  <td>{s.buyer_name}</td>
                  <td>{s.item_sold}</td>
                  <td>{s.quantity_sold}</td>
                  <td>₦{Number(s.unit_price).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₦{Number(s.total_amount).toLocaleString()}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-danger" style={{ padding: "5px 10px" }} onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Record Sale" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Buyer Name</label>
              <input className="input" required value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Buyer Contact</label>
              <input className="input" value={form.buyer_contact} onChange={(e) => setForm({ ...form, buyer_contact: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Item Sold</label>
              <input className="input" value={form.item_sold} onChange={(e) => setForm({ ...form, item_sold: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Quantity</label>
                <input className="input" type="number" step="0.1" min="0" required value={form.quantity_sold} onChange={(e) => setForm({ ...form, quantity_sold: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Unit Price (₦)</label>
                <input className="input" type="number" step="0.01" min="0" required value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Source Pen (optional)</label>
              <select className="input" value={form.pen_id} onChange={(e) => setForm({ ...form, pen_id: e.target.value })}>
                <option value="">— None —</option>
                {pens.map((p) => <option key={p.id} value={p.id}>{p.pen_code}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Sale Date</label>
              <input className="input" type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Save Sale</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

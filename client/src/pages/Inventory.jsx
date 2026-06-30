// src/pages/Inventory.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const EMPTY_ITEM = { item_name: "", category: "feed", quantity: "", unit: "", reorder_level: "" };
const EMPTY_TXN = { type: "in", quantity: "", reason: "" };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [txnForm, setTxnForm] = useState(EMPTY_TXN);
  const { isAdmin } = useAuth();

  function loadItems() {
    setLoading(true);
    apiClient
      .get("/inventory")
      .then(({ data }) => setItems(data))
      .catch(() => setError("Could not load inventory."))
      .finally(() => setLoading(false));
  }

  useEffect(loadItems, []);

  async function handleCreateItem(e) {
    e.preventDefault();
    try {
      await apiClient.post("/inventory", itemForm);
      setShowItemModal(false);
      setItemForm(EMPTY_ITEM);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create item.");
    }
  }

  function openTxn(item) {
    setActiveItem(item);
    setTxnForm(EMPTY_TXN);
    setShowTxnModal(true);
  }

  async function handleTxnSubmit(e) {
    e.preventDefault();
    try {
      await apiClient.post(`/inventory/${activeItem.id}/transactions`, txnForm);
      setShowTxnModal(false);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record transaction.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this inventory item and its history?")) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Inventory</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Feed, equipment, and live snail stock levels.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowItemModal(true)}>+ Add Item</button>
        )}
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {loading && <p style={{ color: "var(--color-ink-muted)" }}>Loading…</p>}

      {!loading && items.length === 0 && !error && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          No inventory items yet.
        </div>
      )}

      {items.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Last Restocked</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = Number(item.quantity) <= Number(item.reorder_level);
                return (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td><span className="badge" style={{ background: "#EFE9DA", color: "var(--color-ink-muted)" }}>{item.category.replace("_", " ")}</span></td>
                    <td style={{ color: isLow ? "var(--color-danger)" : "inherit", fontWeight: isLow ? 600 : 400 }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td>{item.reorder_level} {item.unit}</td>
                    <td>{item.last_restocked ? new Date(item.last_restocked).toLocaleDateString() : "—"}</td>
                    <td>
                      <button className="btn btn-outline" style={{ marginRight: 8, padding: "5px 10px" }} onClick={() => openTxn(item)}>
                        Adjust Stock
                      </button>
                      {isAdmin && (
                        <button className="btn btn-danger" style={{ padding: "5px 10px" }} onClick={() => handleDelete(item.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showItemModal && (
        <Modal title="Add Inventory Item" onClose={() => setShowItemModal(false)}>
          <form onSubmit={handleCreateItem}>
            <div style={{ marginBottom: 14 }}>
              <label>Item Name</label>
              <input className="input" required value={itemForm.item_name} onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Category</label>
              <select className="input" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
                <option value="feed">Feed</option>
                <option value="equipment">Equipment</option>
                <option value="live_snail">Live Snail Stock</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Starting Quantity</label>
                <input className="input" type="number" min="0" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Unit</label>
                <input className="input" placeholder="kg, pieces, units" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Reorder Level</label>
              <input className="input" type="number" min="0" value={itemForm.reorder_level} onChange={(e) => setItemForm({ ...itemForm, reorder_level: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Item</button>
          </form>
        </Modal>
      )}

      {showTxnModal && activeItem && (
        <Modal title={`Adjust Stock — ${activeItem.item_name}`} onClose={() => setShowTxnModal(false)}>
          <form onSubmit={handleTxnSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Transaction Type</label>
              <select className="input" value={txnForm.type} onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })}>
                <option value="in">Stock In (restock, harvest, transfer in)</option>
                <option value="out">Stock Out (usage, sale, mortality)</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Quantity ({activeItem.unit})</label>
              <input className="input" type="number" step="0.1" min="0" required value={txnForm.quantity} onChange={(e) => setTxnForm({ ...txnForm, quantity: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Reason</label>
              <input className="input" placeholder="e.g. weekly restock, sold to buyer" value={txnForm.reason} onChange={(e) => setTxnForm({ ...txnForm, reason: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Record Transaction</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// src/pages/Users.jsx
import { useState } from "react";
import apiClient from "../api/client";
import Modal from "../components/Modal";

const EMPTY_FORM = { full_name: "", email: "", password: "", role: "staff" };

export default function Users() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiClient.post("/auth/register", form);
      setMessage(`Account created for ${form.full_name} (${form.role}).`);
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Users</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>Create Admin or Staff accounts for the system.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      {message && (
        <div className="card" style={{ padding: "14px 18px", marginBottom: 18, color: "var(--color-primary-dark)", background: "#EFF4EA" }}>
          {message}
        </div>
      )}

      <div className="card" style={{ padding: 32, color: "var(--color-ink-muted)" }}>
        For security, the list of existing accounts isn't shown here — use this page to create new Admin or Staff
        logins for people who need access to the system.
      </div>

      {showModal && (
        <Modal title="Add User" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Full Name</label>
              <input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Temporary Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p style={{ color: "var(--color-danger)", marginBottom: 14 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Create Account</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

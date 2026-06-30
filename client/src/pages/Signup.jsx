// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SpiralMark from "../components/SpiralMark";

export default function Signup() {
  const [form, setForm] = useState({
    organization_name: "",
    full_name: "",
    email: "",
    password: "",
    contact_phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "24px 16px",
      }}
    >
      <div className="card" style={{ width: 460, padding: "40px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <SpiralMark size={30} color="var(--color-accent)" />
          <div>
            <h1 style={{ fontSize: "1.4rem" }}>SNAIL Platform</h1>
            <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
              Register your farm business
            </div>
          </div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", marginTop: 0, marginBottom: 24 }}>
          You'll become the Admin of your farm's workspace and can add staff from there.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Farm Details */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Farm Business
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Farm / Business Name</label>
              <input className="input" required value={form.organization_name} onChange={set("organization_name")} placeholder="e.g. Green Acres Snail Farm" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Phone (optional)</label>
              <input className="input" value={form.contact_phone} onChange={set("contact_phone")} placeholder="+234..." />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Address (optional)</label>
              <input className="input" value={form.address} onChange={set("address")} placeholder="Farm location" />
            </div>
          </div>

          {/* Admin Account */}
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Admin Account
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Your Full Name</label>
            <input className="input" required value={form.full_name} onChange={set("full_name")} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={set("email")} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={set("password")} />
          </div>

          {error && (
            <div style={{ background: "#F5DFDB", color: "var(--color-danger)", padding: "10px 12px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating your workspace…" : "Create Farm Workspace"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "var(--color-ink-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

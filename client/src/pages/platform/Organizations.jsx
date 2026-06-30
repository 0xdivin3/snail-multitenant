// src/pages/platform/Organizations.jsx
import { useEffect, useState } from "react";
import apiClient from "../../api/client";

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [orgUsers, setOrgUsers] = useState({});

  function loadOrgs() {
    setLoading(true);
    apiClient
      .get("/organizations")
      .then(({ data }) => setOrgs(data))
      .catch(() => setError("Could not load organizations."))
      .finally(() => setLoading(false));
  }

  useEffect(loadOrgs, []);

  async function toggleStatus(org) {
    const newStatus = org.status === "active" ? "suspended" : "active";
    if (!confirm(`${newStatus === "suspended" ? "Suspend" : "Reactivate"} ${org.name}?`)) return;
    try {
      await apiClient.patch(`/organizations/${org.id}/status`, { status: newStatus });
      loadOrgs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  }

  async function toggleExpand(orgId) {
    if (expandedId === orgId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orgId);
    if (!orgUsers[orgId]) {
      try {
        const { data } = await apiClient.get(`/organizations/${orgId}/users`);
        setOrgUsers((prev) => ({ ...prev, [orgId]: data }));
      } catch {
        setOrgUsers((prev) => ({ ...prev, [orgId]: [] }));
      }
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Farm Organizations</h1>
      <p style={{ color: "var(--color-ink-muted)", marginTop: 0, marginBottom: 28 }}>
        All registered farm businesses on the platform.
      </p>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {loading && <p style={{ color: "var(--color-ink-muted)" }}>Loading…</p>}

      {!loading && orgs.length === 0 && !error && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          No organizations have signed up yet.
        </div>
      )}

      {orgs.map((org) => (
        <div key={org.id} className="card" style={{ marginBottom: 14, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 22px",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{org.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", fontFamily: "var(--font-mono)" }}>
                {org.slug}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", marginTop: 2 }}>
                {org.contact_email} · Joined {new Date(org.created_at).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className={`badge badge-${org.status}`}>{org.status}</span>
              <button
                className="btn btn-outline"
                style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                onClick={() => toggleExpand(org.id)}
              >
                {expandedId === org.id ? "Hide Users" : "View Users"}
              </button>
              <button
                className={`btn ${org.status === "active" ? "btn-danger" : "btn-primary"}`}
                style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                onClick={() => toggleStatus(org)}
              >
                {org.status === "active" ? "Suspend" : "Reactivate"}
              </button>
            </div>
          </div>

          {expandedId === org.id && (
            <div style={{ borderTop: "1px solid var(--color-border)", padding: "0" }}>
              {!orgUsers[org.id] ? (
                <p style={{ padding: "16px 22px", color: "var(--color-ink-muted)" }}>Loading users…</p>
              ) : orgUsers[org.id].length === 0 ? (
                <p style={{ padding: "16px 22px", color: "var(--color-ink-muted)" }}>No users found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgUsers[org.id].map((u) => (
                      <tr key={u.id}>
                        <td>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                        <td>{u.is_active ? "Active" : "Inactive"}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

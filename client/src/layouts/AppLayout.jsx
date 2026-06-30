// src/layouts/AppLayout.jsx
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SpiralMark from "../components/SpiralMark";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", adminOnly: false },
  { to: "/pens", label: "Pens", adminOnly: false },
  { to: "/breeding", label: "Breeding", adminOnly: false },
  { to: "/feeding", label: "Feeding", adminOnly: false },
  { to: "/inventory", label: "Inventory", adminOnly: false },
  { to: "/sales", label: "Sales", adminOnly: false },
  { to: "/reports", label: "Reports", adminOnly: true },
  { to: "/users", label: "Users", adminOnly: true },
];

function NavItems({ items, isAdmin, onNavClick }) {
  return items
    .filter((item) => !item.adminOnly || isAdmin)
    .map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavClick}
        style={({ isActive }) => ({
          display: "block",
          padding: "10px 14px",
          marginBottom: 2,
          borderRadius: 8,
          fontSize: "0.92rem",
          fontWeight: 500,
          color: isActive ? "#2B2118" : "#E8E2D5",
          background: isActive ? "#C9A66B" : "transparent",
          textDecoration: "none",
        })}
      >
        {item.label}
      </NavLink>
    ));
}

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const sidebarStyle = {
    width: "var(--sidebar-width)",
    background: "var(--color-ink)",
    color: "#F6F2E9",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    minHeight: "100vh",
  };

  return (
    <>
      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        .app-shell { display: flex; min-height: 100vh; }

        /* Desktop sidebar — visible by default */
        .app-sidebar { display: flex; }

        /* Mobile top bar — hidden by default */
        .app-topbar {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          background: var(--color-ink); padding: 12px 16px;
          align-items: center; justify-content: space-between;
        }
        .hamburger {
          background: none; border: none; cursor: pointer;
          display: flex; flex-direction: column; gap: 5px; padding: 4px;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: #E8E2D5; border-radius: 2px;
        }

        /* Mobile drawer overlay */
        .mobile-overlay {
          display: none; position: fixed; inset: 0; z-index: 190;
          background: rgba(0,0,0,0.5);
        }
        .mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 195;
          width: 240px; background: var(--color-ink);
          display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.25s ease;
        }
        .mobile-drawer.open { transform: translateX(0); }

        .app-main { flex: 1; padding: 28px 20px; overflow-x: auto; }

        @media (max-width: 767px) {
          .app-sidebar { display: none !important; }
          .app-topbar { display: flex; }
          .mobile-overlay { display: block; }
          .app-main { padding-top: 68px; padding-left: 16px; padding-right: 16px; }
        }

        @media (min-width: 768px) {
          .mobile-overlay { display: none !important; }
          .mobile-drawer { display: none !important; }
          .app-topbar { display: none !important; }
          .app-main { padding: 32px 40px; }
        }
      `}</style>

      {/* ── MOBILE TOP BAR ── */}
      <div className="app-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SpiralMark size={22} color="#C9A66B" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "#F6F2E9" }}>
            SNAIL
          </span>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </div>

      {/* ── MOBILE OVERLAY + DRAWER ── */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <SpiralMark size={22} color="#C9A66B" />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "#F6F2E9" }}>
              SNAIL
            </span>
          </div>
          {user?.organization_name && (
            <div style={{ fontSize: "0.72rem", color: "#B5A98C", paddingLeft: 2 }}>{user.organization_name}</div>
          )}
        </div>
        <nav style={{ flex: 1, padding: "10px 12px", overflowY: "auto" }}>
          <NavItems items={NAV_ITEMS} isAdmin={isAdmin} onNavClick={() => setMenuOpen(false)} />
        </nav>
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#F6F2E9" }}>{user?.full_name}</div>
          <div style={{ fontSize: "0.72rem", color: "#B5A98C", marginBottom: 10, textTransform: "capitalize" }}>{user?.role}</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%", borderColor: "rgba(255,255,255,0.25)", color: "#F6F2E9" }}>
            Log out
          </button>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="app-shell">
        <aside className="app-sidebar" style={sidebarStyle}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <SpiralMark size={26} color="#C9A66B" />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600 }}>SNAIL</span>
            </div>
            {user?.organization_name && (
              <div style={{ fontSize: "0.72rem", color: "#B5A98C", paddingLeft: 2 }}>{user.organization_name}</div>
            )}
          </div>
          <nav style={{ flex: 1, padding: "8px 12px" }}>
            <NavItems items={NAV_ITEMS} isAdmin={isAdmin} onNavClick={() => {}} />
          </nav>
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.full_name}</div>
            <div style={{ fontSize: "0.75rem", color: "#B5A98C", marginBottom: 10, textTransform: "capitalize" }}>{user?.role}</div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%", borderColor: "rgba(255,255,255,0.25)", color: "#F6F2E9" }}>
              Log out
            </button>
          </div>
        </aside>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

// src/layouts/PlatformLayout.jsx
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SpiralMark from "../components/SpiralMark";

const NAV_ITEMS = [
  { to: "/platform", label: "Platform Overview" },
  { to: "/platform/organizations", label: "Farm Organizations" },
];

function NavItems({ onNavClick }) {
  return NAV_ITEMS.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === "/platform"}
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

export default function PlatformLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const bg = "#1A1412";

  return (
    <>
      <style>{`
        .plat-shell { display: flex; min-height: 100vh; }
        .plat-sidebar { display: flex; }
        .plat-topbar {
          display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          background: ${bg}; padding: 12px 16px;
          align-items: center; justify-content: space-between;
        }
        .plat-overlay { display: none; position: fixed; inset: 0; z-index: 190; background: rgba(0,0,0,0.5); }
        .plat-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 195;
          width: 240px; background: ${bg};
          display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.25s ease;
        }
        .plat-drawer.open { transform: translateX(0); }
        .plat-main { flex: 1; padding: 28px 20px; overflow-x: auto; }

        @media (max-width: 767px) {
          .plat-sidebar { display: none !important; }
          .plat-topbar { display: flex; }
          .plat-overlay { display: block; }
          .plat-main { padding-top: 68px; padding-left: 16px; padding-right: 16px; }
        }
        @media (min-width: 768px) {
          .plat-overlay, .plat-drawer, .plat-topbar { display: none !important; }
          .plat-main { padding: 32px 40px; }
        }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className="plat-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SpiralMark size={22} color="#C9A66B" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "#F6F2E9" }}>SNAIL</span>
        </div>
        <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4 }} aria-label="Open menu">
          <span style={{ display: "block", width: 22, height: 2, background: "#E8E2D5", borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#E8E2D5", borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#E8E2D5", borderRadius: 2 }} />
        </button>
      </div>

      {menuOpen && <div className="plat-overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`plat-drawer ${menuOpen ? "open" : ""}`}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <SpiralMark size={22} color="#C9A66B" />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "#F6F2E9" }}>SNAIL</span>
          </div>
          <div style={{ fontSize: "0.68rem", color: "#C44536", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Platform Admin</div>
        </div>
        <nav style={{ flex: 1, padding: "10px 12px" }}>
          <NavItems onNavClick={() => setMenuOpen(false)} />
        </nav>
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#F6F2E9" }}>{user?.full_name}</div>
          <div style={{ fontSize: "0.68rem", color: "#C44536", marginBottom: 10, fontWeight: 600 }}>Super Admin</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%", borderColor: "rgba(255,255,255,0.2)", color: "#F6F2E9" }}>Log out</button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="plat-shell">
        <aside className="plat-sidebar" style={{ width: "var(--sidebar-width)", background: bg, color: "#F6F2E9", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
          <div style={{ padding: "22px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <SpiralMark size={26} color="#C9A66B" />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600 }}>SNAIL</span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "#C44536", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Platform Admin</div>
          </div>
          <nav style={{ flex: 1, padding: "12px" }}>
            <NavItems onNavClick={() => {}} />
          </nav>
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.full_name}</div>
            <div style={{ fontSize: "0.68rem", color: "#C44536", marginBottom: 10, fontWeight: 600 }}>Super Admin</div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%", borderColor: "rgba(255,255,255,0.2)", color: "#F6F2E9" }}>Log out</button>
          </div>
        </aside>
        <main className="plat-main"><Outlet /></main>
      </div>
    </>
  );
}

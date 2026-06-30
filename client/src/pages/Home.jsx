// src/pages/Home.jsx
import { Link } from "react-router-dom";
import SpiralMark from "../components/SpiralMark";

const FEATURES = [
  { title: "Pen Management", desc: "Track every pen and bed — capacity, snail count, species, and status in one place.", icon: "🏠" },
  { title: "Breeding Records", desc: "Log mating batches, monitor incubation, and record hatchling counts.", icon: "🐌" },
  { title: "Feeding Logs", desc: "Record daily feed types and quantities per pen with full traceability.", icon: "🌿" },
  { title: "Inventory Control", desc: "Manage feed stock, equipment, and live snail inventory with audit trails.", icon: "📦" },
  { title: "Sales Tracking", desc: "Record every sale, track buyers, and see your total revenue at a glance.", icon: "💰" },
  { title: "Auto Reports", desc: "Generate feeding, breeding, inventory, and sales reports with date filtering.", icon: "📊" },
];

const STEPS = [
  { step: "01", title: "Register your farm", desc: "Sign up with your farm name and contact details. Takes under a minute." },
  { step: "02", title: "Set up your workspace", desc: "Add your pens, stock your inventory, and invite your staff team." },
  { step: "03", title: "Start managing", desc: "Log feeding, track breeding, record sales, and generate reports daily." },
];

const S = {
  section: { padding: "60px 20px" },
  sectionWide: { padding: "60px 20px", maxWidth: 1000, margin: "0 auto" },
  centerText: { textAlign: "center" },
  h2: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.5rem, 5vw, 2rem)",
    marginBottom: 8,
  },
  sub: { color: "var(--color-ink-muted)", marginBottom: 40, fontSize: "0.95rem" },
};

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        .home-nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: var(--color-ink); position: sticky; top: 0; z-index: 50; }
        .nav-links { display: flex; gap: 10px; align-items: center; }
        .nav-btn-outline { color: #E8E2D5; font-weight: 500; font-size: 0.85rem; padding: 7px 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; white-space: nowrap; }
        .nav-btn-primary { background: var(--color-primary); color: white; font-weight: 600; font-size: 0.85rem; padding: 7px 14px; border-radius: 6px; text-decoration: none; white-space: nowrap; }

        .hero { background: var(--color-ink); color: #F6F2E9; padding: 60px 20px 56px; text-align: center; }
        .hero-title { font-family: var(--font-display); font-size: clamp(1.9rem, 7vw, 3.4rem); font-weight: 700; line-height: 1.15; margin: 0 0 16px; color: #F6F2E9; }
        .hero-sub { font-size: clamp(0.9rem, 3vw, 1.1rem); color: #B5A98C; line-height: 1.7; margin: 0 auto 36px; max-width: 520px; }
        .hero-btns { display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .hero-btn-main { background: var(--color-primary); color: white; font-weight: 700; font-size: 1rem; padding: 14px 28px; border-radius: 8px; text-decoration: none; width: 100%; max-width: 320px; text-align: center; box-sizing: border-box; }
        .hero-btn-outline { background: transparent; color: #E8E2D5; font-weight: 600; font-size: 1rem; padding: 13px 28px; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2); width: 100%; max-width: 320px; text-align: center; box-sizing: border-box; }

        .features-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .steps-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }

        .cta-section { background: var(--color-primary); padding: 60px 20px; text-align: center; }
        .cta-btn { background: white; color: var(--color-primary-dark); font-weight: 700; font-size: 1rem; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; }

        .footer { background: var(--color-ink); color: #8A7A6A; padding: 24px 20px; font-size: 0.82rem; }
        .footer-inner { display: flex; flex-direction: column; gap: 14px; align-items: center; text-align: center; }
        .footer-links { display: flex; gap: 20px; }

        @media (min-width: 600px) {
          .home-nav { padding: 16px 40px; }
          .hero { padding: 80px 40px; }
          .hero-btns { flex-direction: row; justify-content: center; }
          .hero-btn-main, .hero-btn-outline { width: auto; max-width: none; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: repeat(3, 1fr); }
          .footer-inner { flex-direction: row; justify-content: space-between; text-align: left; }
        }

        @media (min-width: 900px) {
          .home-nav { padding: 16px 60px; }
          .hero { padding: 90px 60px 80px; }
          .features-grid { grid-template-columns: repeat(3, 1fr); }
          .footer { padding: 28px 60px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="home-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SpiralMark size={24} color="#C9A66B" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: "#F6F2E9" }}>
            SNAIL
          </span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn-outline">Sign in</Link>
          <Link to="/signup" className="nav-btn-primary">Get Started Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(201,166,107,0.15)", border: "1px solid rgba(201,166,107,0.3)",
            borderRadius: 999, padding: "5px 14px", fontSize: "0.75rem", color: "#C9A66B",
            fontWeight: 600, marginBottom: 24, letterSpacing: "0.04em",
          }}>
            <SpiralMark size={13} color="#C9A66B" />
            SNAIL Farm Management Platform
          </div>

          <h1 className="hero-title">
            Manage your snail farm<br />
            <span style={{ color: "#C9A66B" }}>the smart way</span>
          </h1>

          <p className="hero-sub">
            SNAIL is a complete digital management system for snail farm businesses —
            track pens, breeding, feeding, inventory, and sales all in one secure workspace.
          </p>

          <div className="hero-btns">
            <Link to="/signup" className="hero-btn-main">Register Your Farm — It's Free</Link>
            <Link to="/login" className="hero-btn-outline">Sign in to your workspace</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "var(--color-bg)", padding: "60px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ ...S.h2, ...S.centerText }}>Everything your farm needs</h2>
          <p style={{ ...S.sub, ...S.centerText }}>
            Six core modules covering the full lifecycle of snail farm management.
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: "22px 20px" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ fontSize: "0.95rem", marginBottom: 6 }}>{f.title}</h3>
                <p style={{ color: "var(--color-ink-muted)", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#EFEBE0", padding: "60px 20px", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ ...S.h2, ...S.centerText }}>Up and running in minutes</h2>
          <p style={{ ...S.sub, ...S.centerText }}>No installation, no setup fee. Just sign up and start.</p>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "var(--color-ink)", color: "#C9A66B",
                  fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: "0.95rem", marginBottom: 6 }}>{s.title}</h3>
                <p style={{ color: "var(--color-ink-muted)", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <SpiralMark size={32} color="rgba(255,255,255,0.7)" />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "white", margin: "14px 0 10px" }}>
            Ready to modernize your farm?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 28, fontSize: "0.95rem" }}>
            Join other snail farm businesses already managing their operations on SNAIL.
          </p>
          <Link to="/signup" className="cta-btn">Create Your Free Workspace</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SpiralMark size={16} color="#C9A66B" />
            <span style={{ color: "#B5A98C", fontWeight: 600 }}>SNAIL Platform</span>
          </div>
          <div>Computerized Snail Farm Management System</div>
          <div className="footer-links">
            <Link to="/login" style={{ color: "#8A7A6A" }}>Sign in</Link>
            <Link to="/signup" style={{ color: "#8A7A6A" }}>Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

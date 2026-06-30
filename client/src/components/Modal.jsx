// src/components/Modal.jsx
export default function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,33,24,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="card modal-inner"
        style={{ width: 460, maxHeight: "85vh", overflowY: "auto", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.3rem", color: "var(--color-ink-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

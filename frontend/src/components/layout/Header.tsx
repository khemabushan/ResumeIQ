import { FileText } from "lucide-react";

export function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--card-border)",
        background: "var(--card)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--accent)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={18} color="#fff" />
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: "15px",
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
            }}
          >
            ResumeIQ
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <a
            href="#how-it-works"
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.background = "var(--muted-bg)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.background = "transparent")
            }
          >
            How it works
          </a>
        </nav>
      </div>
    </header>
  );
}

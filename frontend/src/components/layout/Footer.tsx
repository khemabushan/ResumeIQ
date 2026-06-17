export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--card-border)",
        padding: "24px",
        textAlign: "center",
        marginTop: "auto",
      }}
    >
      <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
        ResumeIQ — AI-powered resume analysis. Your file is never stored.
      </p>
    </footer>
  );
}

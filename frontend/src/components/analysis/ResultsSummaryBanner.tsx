"use client";

interface ResultsSummaryBannerProps {
  summary: string;
  skeleton?: boolean;
}

export function ResultsSummaryBanner({ summary, skeleton }: ResultsSummaryBannerProps) {
  if (skeleton) {
    return (
      <div
        className="skeleton"
        style={{ height: "64px", borderRadius: "var(--radius-lg)" }}
      />
    );
  }

  return (
    <div
      style={{
        padding: "18px 22px",
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderLeft: "4px solid var(--accent)",
        borderRadius: "var(--radius-lg)",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.7,
          color: "var(--foreground)",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "var(--accent)",
            marginRight: "6px",
          }}
        >
          AI Summary:
        </span>
        {summary}
      </p>
    </div>
  );
}

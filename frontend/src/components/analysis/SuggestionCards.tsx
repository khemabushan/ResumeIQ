"use client";

import { getCategoryIcon, getPriorityColor } from "@/lib/utils";
import type { Suggestion } from "@/types/analysis";

interface SuggestionCardsProps {
  suggestions: Suggestion[];
  skeleton?: boolean;
}

export function SuggestionCards({ suggestions, skeleton }: SuggestionCardsProps) {
  return (
    <div className="card" style={{ padding: "28px 24px" }}>
      <h2
        style={{
          margin: "0 0 20px",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Improvement Suggestions
      </h2>

      {skeleton ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "80px", borderRadius: "var(--radius)" }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {suggestions.map((s, idx) => {
            const priority = getPriorityColor(s.priority);
            return (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  border: `1px solid ${priority.border}`,
                  background: priority.bg,
                  borderRadius: "var(--radius)",
                  animation: `fadeIn 0.3s ease ${idx * 0.06}s both`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{getCategoryIcon(s.category)}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: priority.text,
                    }}
                  >
                    {s.priority} priority · {s.category}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "var(--foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  {s.suggestion}
                </p>
                {s.example && (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: "12px",
                      color: "var(--muted)",
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.example}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

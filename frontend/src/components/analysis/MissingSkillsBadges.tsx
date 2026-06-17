"use client";

import { getImportanceColor } from "@/lib/utils";
import type { SkillGap } from "@/types/analysis";

interface MissingSkillsProps {
  extractedSkills: string[];
  missingSkills: string[];
  skillGapAnalysis: SkillGap[];
  skeleton?: boolean;
}

function SkillBadge({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: 500,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function MissingSkillsBadges({
  extractedSkills,
  missingSkills,
  skillGapAnalysis,
  skeleton,
}: MissingSkillsProps) {
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
        Skill Analysis
      </h2>

      {/* Detected skills */}
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--foreground)",
          }}
        >
          Detected on your resume
        </p>
        {skeleton ? (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[80, 60, 90, 50, 70, 55].map((w, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ width: `${w}px`, height: "26px", borderRadius: "99px" }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {extractedSkills.map((skill) => (
              <SkillBadge
                key={skill}
                label={skill}
                bg="var(--success-light)"
                color="var(--success)"
              />
            ))}
          </div>
        )}
      </div>

      {/* Missing skills */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--foreground)",
          }}
        >
          Missing skills
        </p>
        {skeleton ? (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[65, 75, 50, 85].map((w, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ width: `${w}px`, height: "26px", borderRadius: "99px" }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {missingSkills.map((skill) => (
              <SkillBadge
                key={skill}
                label={skill}
                bg="var(--danger-light)"
                color="var(--danger)"
              />
            ))}
          </div>
        )}
      </div>

      {/* Skill gap detail */}
      <div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--foreground)",
          }}
        >
          How to close the gap
        </p>

        {skeleton ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: "60px", borderRadius: "var(--radius)" }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {skillGapAnalysis.map((item) => {
              const { bg, text } = getImportanceColor(item.importance);
              return (
                <div
                  key={item.skill}
                  style={{
                    padding: "12px 14px",
                    background: "var(--muted-bg)",
                    borderRadius: "var(--radius)",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "99px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: bg,
                      color: text,
                      flexShrink: 0,
                      marginTop: "1px",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.importance}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: "0 0 3px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      {item.skill}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                      {item.how_to_learn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import type { ATSBreakdown } from "@/types/analysis";

interface ATSScoreGaugeProps {
  score: number;
  breakdown: ATSBreakdown;
  skeleton?: boolean;
}

function BreakdownRow({
  label,
  value,
  skeleton,
}: {
  label: string;
  value: number;
  skeleton?: boolean;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        {skeleton ? (
          <>
            <div className="skeleton" style={{ width: "100px", height: "12px" }} />
            <div className="skeleton" style={{ width: "30px", height: "12px" }} />
          </>
        ) : (
          <>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>{label}</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>
              {value}%
            </span>
          </>
        )}
      </div>
      <div
        style={{
          height: "5px",
          background: "var(--muted-bg)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        {!skeleton && (
          <div
            style={{
              height: "100%",
              width: `${value}%`,
              background: getScoreColor(value),
              borderRadius: "99px",
              transition: "width 1s cubic-bezier(0.4,0,0.2,1) 0.3s",
            }}
          />
        )}
      </div>
    </div>
  );
}

export function ATSScoreGauge({ score, breakdown, skeleton }: ATSScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (skeleton) return;
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score, skeleton]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="card" style={{ padding: "28px 24px" }}>
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        ATS Score
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
          marginBottom: "28px",
        }}
      >
        {skeleton ? (
          <div
            className="skeleton"
            style={{ width: "120px", height: "120px", borderRadius: "50%", flexShrink: 0 }}
          />
        ) : (
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--muted-bg)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="score-ring"
              transform="rotate(-90 60 60)"
            />
            <text
              x="60"
              y="56"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: "22px", fontWeight: 700, fill: color }}
            >
              {animatedScore}
            </text>
            <text
              x="60"
              y="74"
              textAnchor="middle"
              style={{ fontSize: "11px", fill: "var(--muted)" }}
            >
              {getScoreLabel(score)}
            </text>
          </svg>
        )}

        <div style={{ flex: 1 }}>
          {skeleton ? (
            <div className="skeleton" style={{ width: "80%", height: "14px" }} />
          ) : (
            <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
              Your resume scores <strong style={{ color }}>{score}/100</strong> for ATS
              compatibility. {score < 70 && "Focus on the suggestions below to improve it."}
              {score >= 70 && score < 85 && "A few targeted improvements will push you higher."}
              {score >= 85 && "You're in great shape. Fine-tune the details below."}
            </p>
          )}
        </div>
      </div>

      <div>
        <BreakdownRow
          label="Keyword match"
          value={breakdown?.keyword_match ?? 0}
          skeleton={skeleton}
        />
        <BreakdownRow
          label="Format"
          value={breakdown?.format_score ?? 0}
          skeleton={skeleton}
        />
        <BreakdownRow
          label="Section completeness"
          value={breakdown?.section_completeness ?? 0}
          skeleton={skeleton}
        />
      </div>
    </div>
  );
}

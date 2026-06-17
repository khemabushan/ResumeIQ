"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ATSScoreGauge } from "@/components/analysis/ATSScoreGauge";
import { MissingSkillsBadges } from "@/components/analysis/MissingSkillsBadges";
import { SuggestionCards } from "@/components/analysis/SuggestionCards";
import { ResultsSummaryBanner } from "@/components/analysis/ResultsSummaryBanner";
import type { AnalysisResult } from "@/types/analysis";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("resumeiq_result");
    if (raw) {
      try {
        setResult(JSON.parse(raw) as AnalysisResult);
      } catch {
        /* invalid json — show skeleton then redirect */
      }
    }
    // Brief delay so skeletons animate in gracefully
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // If no result after loading, bounce back home
  useEffect(() => {
    if (!loading && !result) router.replace("/");
  }, [loading, result, router]);

  const skeleton = loading || !result;

  return (
    <>
      <Header />
      <main
        style={{
          flex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 24px 80px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius)",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--foreground)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--muted-bg)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <ArrowLeft size={14} />
            Analyse another resume
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem("resumeiq_result");
              router.push("/");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "var(--muted)",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "8px 4px",
            }}
          >
            <RefreshCw size={13} />
            Start over
          </button>
        </div>

        {/* Page heading */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            Resume Analysis
          </h1>
          {skeleton ? (
            <div
              className="skeleton"
              style={{ width: "200px", height: "14px", marginTop: "8px" }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>
              Based on your uploaded resume
            </p>
          )}
        </div>

        {/* AI Summary */}
        <div style={{ marginBottom: "24px" }}>
          <ResultsSummaryBanner
            summary={result?.summary ?? ""}
            skeleton={skeleton}
          />
        </div>

        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ATSScoreGauge
              score={result?.ats_score ?? 0}
              breakdown={
                result?.ats_breakdown ?? {
                  keyword_match: 0,
                  format_score: 0,
                  section_completeness: 0,
                }
              }
              skeleton={skeleton}
            />

            <MissingSkillsBadges
              extractedSkills={result?.extracted_skills ?? []}
              missingSkills={result?.missing_skills ?? []}
              skillGapAnalysis={result?.skill_gap_analysis ?? []}
              skeleton={skeleton}
            />
          </div>

          {/* Right column */}
          <SuggestionCards
            suggestions={result?.suggestions ?? []}
            skeleton={skeleton}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

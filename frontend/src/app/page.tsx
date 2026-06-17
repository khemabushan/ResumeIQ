"use client";

import { useRouter } from "next/navigation";
import { Zap, Shield, BarChart3 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/upload/DropZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "ATS Score",
    desc: "Know exactly how recruiters' software ranks you before they see your name.",
  },
  {
    icon: Zap,
    title: "Skill gap analysis",
    desc: "See what skills are missing for your target role and how to get them fast.",
  },
  {
    icon: Shield,
    title: "Privacy first",
    desc: "Your resume is analysed in memory and never stored on our servers.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const {
    file,
    jobDescription,
    setJobDescription,
    status,
    result,
    error,
    progress,
    selectFile,
    analyze,
    reset,
  } = useResumeUpload();

  useEffect(() => {
    if (status === "done" && result) {
      sessionStorage.setItem("resumeiq_result", JSON.stringify(result));
      router.push("/results");
    }
  }, [status, result, router]);

  const isLoading = status === "uploading" || status === "analyzing";

  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section
          style={{
            padding: "72px 24px 56px",
            textAlign: "center",
            maxWidth: "680px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              background: "var(--accent-light)",
              border: "1px solid var(--accent-border)",
              borderRadius: "99px",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--accent)",
              marginBottom: "24px",
            }}
          >
            <Zap size={12} />
            Powered by ResumeIQ AI
          </div>

          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--foreground)",
            }}
          >
            Your resume,{" "}
            <span style={{ color: "var(--accent)" }}>objectively scored</span>
          </h1>

          <p
            style={{
              margin: "0 0 48px",
              fontSize: "17px",
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Upload your PDF and get an ATS score, missing skills, and clear
            suggestions in under 30 seconds.
          </p>

          {/* Upload card */}
          <div
            className="card"
            style={{ padding: "28px", textAlign: "left", marginBottom: "20px" }}
          >
            <DropZone
              file={file}
              error={error}
              onFile={selectFile}
              onClear={reset}
              disabled={isLoading}
            />

            {/* Optional job description */}
            {file && !isLoading && (
              <div style={{ marginTop: "16px", animation: "fadeIn 0.3s ease" }}>
                <label
                  htmlFor="jd"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    marginBottom: "6px",
                  }}
                >
                  Job description{" "}
                  <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                    (optional — improves skill gap targeting)
                  </span>
                </label>
                <textarea
                  id="jd"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here…"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "var(--foreground)",
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--radius)",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--card-border)")
                  }
                />
              </div>
            )}

            {/* Progress */}
            {(isLoading || status === "done") && (
              <div style={{ marginTop: "16px" }}>
                <UploadProgress status={status} progress={progress} />
              </div>
            )}

            {/* Analyse button */}
            {file && status !== "done" && (
              <button
                onClick={analyze}
                disabled={isLoading}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "13px",
                  background: isLoading ? "var(--muted-bg)" : "var(--accent)",
                  color: isLoading ? "var(--muted)" : "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.2s, transform 0.1s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    (e.currentTarget.style.background = "#1d4ed8");
                }}
                onMouseLeave={(e) => {
                  if (!isLoading)
                    (e.currentTarget.style.background = "var(--accent)");
                }}
              >
                {isLoading ? "Analysing…" : "Analyse my resume"}
              </button>
            )}
          </div>
        </section>

        {/* Feature highlights */}
        <section
          id="how-it-works"
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "0 24px 80px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card"
              style={{ padding: "22px 20px" }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  background: "var(--accent-light)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Icon size={18} color="var(--accent)" />
              </div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {title}
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

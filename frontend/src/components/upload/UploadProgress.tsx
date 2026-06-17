"use client";

import type { UploadStatus } from "@/types/analysis";

interface UploadProgressProps {
  status: UploadStatus;
  progress: number;
}

const STATUS_LABELS: Record<UploadStatus, string> = {
  idle: "",
  uploading: "Uploading your resume…",
  analyzing: "ResumeIQ is reading your resume…",
  done: "Analysis complete",
  error: "",
};

export function UploadProgress({ status, progress }: UploadProgressProps) {
  if (status === "idle" || status === "error") return null;

  const isDone = status === "done";
  const color = isDone ? "var(--success)" : "var(--accent)";

  return (
    <div
      style={{
        padding: "16px 20px",
        background: isDone ? "var(--success-light)" : "var(--accent-light)",
        border: `1px solid ${isDone ? "#a7f3d0" : "var(--accent-border)"}`,
        borderRadius: "var(--radius)",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 500, color }}>
          {STATUS_LABELS[status]}
        </span>
        <span style={{ fontSize: "12px", color, opacity: 0.8 }}>
          {progress}%
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: isDone ? "#a7f3d0" : "var(--accent-border)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: color,
            borderRadius: "99px",
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

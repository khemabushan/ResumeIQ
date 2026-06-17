import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#059669";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  return "Needs work";
}

export function getPriorityColor(priority: "high" | "medium" | "low") {
  const map = {
    high: { bg: "var(--danger-light)", text: "var(--danger)", border: "#fecaca" },
    medium: { bg: "var(--warning-light)", text: "var(--warning)", border: "#fde68a" },
    low: { bg: "var(--success-light)", text: "var(--success)", border: "#a7f3d0" },
  };
  return map[priority];
}

export function getImportanceColor(importance: "critical" | "recommended" | "nice-to-have") {
  const map = {
    critical: { bg: "var(--danger-light)", text: "var(--danger)" },
    recommended: { bg: "var(--warning-light)", text: "var(--warning)" },
    "nice-to-have": { bg: "var(--success-light)", text: "var(--success)" },
  };
  return map[importance];
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    format: "📐",
    content: "✍️",
    keywords: "🔑",
    impact: "⚡",
  };
  return map[category] ?? "💡";
}

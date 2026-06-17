import type { AnalysisResult } from "@/types/analysis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function analyzeResume(
  file: File,
  jobDescription?: string
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);
  if (jobDescription?.trim()) {
    form.append("job_description", jobDescription.trim());
  }

  const res = await fetch(`${API_BASE}/analyze/sync`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Analysis failed. Please try again.");
  }

  return res.json() as Promise<AnalysisResult>;
}

// ─── Mock for frontend-only development ──────────────────────────────────────
export const MOCK_RESULT: AnalysisResult = {
  ats_score: 72,
  ats_breakdown: {
    keyword_match: 68,
    format_score: 85,
    section_completeness: 63,
  },
  extracted_skills: [
    "React", "TypeScript", "Node.js", "REST APIs", "Git",
    "Tailwind CSS", "PostgreSQL", "Agile",
  ],
  missing_skills: [
    "Next.js", "Docker", "AWS", "GraphQL", "CI/CD", "System Design",
  ],
  skill_gap_analysis: [
    {
      skill: "Next.js",
      importance: "critical",
      how_to_learn: "Official Next.js docs + build 1–2 portfolio projects",
    },
    {
      skill: "Docker",
      importance: "recommended",
      how_to_learn: "Docker's Getting Started guide, then containerise an existing project",
    },
    {
      skill: "AWS",
      importance: "recommended",
      how_to_learn: "AWS Free Tier + Stephane Maarek's SAA course on Udemy",
    },
    {
      skill: "GraphQL",
      importance: "nice-to-have",
      how_to_learn: "Apollo GraphQL tutorials, add a GraphQL layer to a side project",
    },
  ],
  suggestions: [
    {
      category: "impact",
      priority: "high",
      suggestion: "Quantify your achievements with metrics — replace vague statements with specific numbers.",
      example: "Instead of 'Improved app performance' -> 'Reduced page load time by 40%, from 3.2 s to 1.9 s'",
    },
    {
      category: "keywords",
      priority: "high",
      suggestion: "Add Next.js, Docker, and CI/CD to your skills section — they appear in 80% of senior frontend JDs.",
    },
    {
      category: "content",
      priority: "medium",
      suggestion: "Your summary is missing. Add a 2–3 sentence professional summary at the top that matches the target role.",
    },
    {
      category: "format",
      priority: "medium",
      suggestion: "Use consistent date formatting across all roles. Some entries use 'Jan 2022' and others '2022-01'.",
    },
    {
      category: "content",
      priority: "low",
      suggestion: "Add links to live projects or your GitHub directly in each experience entry, not just in the header.",
    },
  ],
  summary:
    "Your resume demonstrates solid React and TypeScript experience but lacks cloud and DevOps keywords that ATS systems heavily weight for senior roles. Quantifying impact and adding a professional summary would meaningfully improve your score.",
};

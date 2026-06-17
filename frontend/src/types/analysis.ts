export interface ATSBreakdown {
  keyword_match: number;
  format_score: number;
  section_completeness: number;
}

export interface SkillGap {
  skill: string;
  importance: "critical" | "recommended" | "nice-to-have";
  how_to_learn: string;
}

export interface Suggestion {
  category: "format" | "content" | "keywords" | "impact";
  priority: "high" | "medium" | "low";
  suggestion: string;
  example?: string;
}

export interface AnalysisResult {
  ats_score: number;
  ats_breakdown: ATSBreakdown;
  extracted_skills: string[];
  missing_skills: string[];
  skill_gap_analysis: SkillGap[];
  suggestions: Suggestion[];
  summary: string;
}

export type UploadStatus = "idle" | "uploading" | "analyzing" | "done" | "error";

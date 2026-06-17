from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


# ─── Sub-models (PDF extraction) ──────────────────────────────────────────────

class ExtractedResume(BaseModel):
    text: str
    page_count: int
    word_count: int
    char_count: int
    extraction_warnings: list[str] = Field(default_factory=list)


# ─── Sub-models (Analysis result) ─────────────────────────────────────────────

class ATSBreakdown(BaseModel):
    keyword_match: int = Field(..., ge=0, le=100)
    format_score: int  = Field(..., ge=0, le=100)
    section_completeness: int = Field(..., ge=0, le=100)


class SkillGap(BaseModel):
    skill: str
    importance: Literal["critical", "recommended", "nice-to-have"]
    how_to_learn: str


class Suggestion(BaseModel):
    category: Literal["format", "content", "keywords", "impact"]
    priority: Literal["high", "medium", "low"]
    suggestion: str
    example: str | None = None


# ─── Top-level API response ────────────────────────────────────────────────────

class AnalysisResult(BaseModel):
    """Shape consumed by the Next.js frontend."""
    ats_score: int = Field(..., ge=0, le=100)
    ats_breakdown: ATSBreakdown
    extracted_skills: list[str]
    missing_skills: list[str]
    skill_gap_analysis: list[SkillGap]
    suggestions: list[Suggestion]
    summary: str


# ─── Meta ─────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str


class ErrorResponse(BaseModel):
    detail: str

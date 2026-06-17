"""
Rule-based resume analysis engine.

Pipeline
--------
resume text
    │
    ├─► section_detector   → which standard sections are present
    ├─► skill_extractor    → skills found in the text
    ├─► ats_scorer         → keyword_match / format / section scores → composite
    ├─► gap_detector       → missing skills + importance + how-to-learn
    ├─► suggestion_engine  → ordered list of improvement suggestions
    └─► summary_builder    → one-paragraph professional summary
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.models.schemas import (
    AnalysisResult,
    ATSBreakdown,
    SkillGap,
    Suggestion,
)

# ══════════════════════════════════════════════════════════════════════════════
# 1. KNOWLEDGE BASE
# ══════════════════════════════════════════════════════════════════════════════

# Skills are grouped by domain so we can produce targeted gap advice.
# Each entry: skill_display_name → (importance, how_to_learn)
SKILL_DB: dict[str, tuple[str, str, str]] = {
    # ── Languages ──────────────────────────────────────────────────────────────
    "Python":       ("critical",     "languages", "python.org tutorial + build 2 portfolio projects"),
    "JavaScript":   ("critical",     "languages", "javascript.info — free, comprehensive, modern"),
    "TypeScript":   ("critical",     "languages", "typescriptlang.org handbook + add TS to an existing JS project"),
    "Java":         ("recommended",  "languages", "Oracle Java tutorials or 'Head First Java'"),
    "Go":           ("recommended",  "languages", "tour.golang.org — official interactive tour"),
    "Rust":         ("nice-to-have", "languages", "The Rust Book (doc.rust-lang.org/book)"),
    "C++":          ("recommended",  "languages", "learncpp.com — structured free resource"),
    "Ruby":         ("nice-to-have", "languages", "Ruby Koans or The Odin Project"),
    "PHP":          ("nice-to-have", "languages", "laracasts.com or php.net official docs"),
    "Swift":        ("nice-to-have", "languages", "Swift Playgrounds app + Apple developer docs"),
    "Kotlin":       ("nice-to-have", "languages", "kotlinlang.org official docs + Android basics"),

    # ── Frontend ───────────────────────────────────────────────────────────────
    "React":        ("critical",     "frontend", "react.dev official docs — start with the tutorial"),
    "Next.js":      ("critical",     "frontend", "nextjs.org/learn — official step-by-step course"),
    "Vue.js":       ("recommended",  "frontend", "vuejs.org — progressive framework, great docs"),
    "Angular":      ("recommended",  "frontend", "angular.dev — new official learning path"),
    "Tailwind CSS": ("recommended",  "frontend", "tailwindcss.com/docs — scan the core concepts section"),
    "Redux":        ("recommended",  "frontend", "redux.js.org/tutorials/essentials — start with the essentials guide"),
    "HTML":         ("critical",     "frontend", "MDN Web Docs — HTML basics module"),
    "CSS":          ("critical",     "frontend", "MDN CSS + Kevin Powell's YouTube channel"),
    "Webpack":      ("nice-to-have", "frontend", "webpack.js.org/guides — Getting Started guide"),

    # ── Backend ────────────────────────────────────────────────────────────────
    "Node.js":      ("critical",     "backend", "nodejs.org/en/learn — official getting started guide"),
    "FastAPI":      ("recommended",  "backend", "fastapi.tiangolo.com — full tutorial in the official docs"),
    "Django":       ("recommended",  "backend", "djangoproject.com/start — official polls tutorial"),
    "Flask":        ("nice-to-have", "backend", "flask.palletsprojects.com/quickstart"),
    "Express":      ("recommended",  "backend", "expressjs.com/starter/hello-world — then build a REST API"),
    "Spring Boot":  ("recommended",  "backend", "spring.io/quickstart — official 5-minute guide"),
    "GraphQL":      ("recommended",  "backend", "graphql.org/learn — official spec + HowToGraphQL tutorials"),
    "REST APIs":    ("critical",     "backend", "Build 2-3 REST APIs from scratch; read Roy Fielding's constraints"),
    "gRPC":         ("nice-to-have", "backend", "grpc.io/docs/languages — pick your language quickstart"),

    # ── Databases ──────────────────────────────────────────────────────────────
    "PostgreSQL":   ("critical",     "databases", "postgresqltutorial.com — covers 95% of day-to-day SQL"),
    "MySQL":        ("recommended",  "databases", "mysqltutorial.org or the official MySQL 8 reference"),
    "MongoDB":      ("recommended",  "databases", "mongodb.com/docs/manual/tutorial — CRUD + aggregation"),
    "Redis":        ("recommended",  "databases", "redis.io/docs/getting-started — then try caching a real project"),
    "SQL":          ("critical",     "databases", "mode.com/sql-tutorial — free, practical, browser-based"),
    "Elasticsearch":("nice-to-have", "databases", "elastic.co/guide/en/elasticsearch/reference/current"),
    "DynamoDB":     ("nice-to-have", "databases", "AWS DynamoDB Developer Guide + free tier hands-on"),

    # ── Cloud / DevOps ─────────────────────────────────────────────────────────
    "AWS":          ("critical",     "cloud", "AWS Skill Builder free tier + Stephane Maarek SAA on Udemy"),
    "GCP":          ("recommended",  "cloud", "cloud.google.com/training — free digital courses"),
    "Azure":        ("recommended",  "cloud", "Microsoft Learn — Azure Fundamentals AZ-900 path"),
    "Docker":       ("critical",     "devops", "docs.docker.com/get-started — official 8-part guide"),
    "Kubernetes":   ("critical",     "devops", "kubernetes.io/docs/tutorials/kubernetes-basics"),
    "CI/CD":        ("critical",     "devops", "GitHub Actions docs + build a pipeline for an existing project"),
    "Terraform":    ("recommended",  "devops", "developer.hashicorp.com/terraform/tutorials — AWS track"),
    "Ansible":      ("nice-to-have", "devops", "docs.ansible.com — Getting Started guide"),
    "Linux":        ("critical",     "devops", "linuxcommand.org or 'The Linux Command Line' book (free PDF)"),

    # ── Data / ML ──────────────────────────────────────────────────────────────
    "Machine Learning": ("recommended", "ml", "fast.ai (top-down) or Andrew Ng's ML Specialization on Coursera"),
    "TensorFlow":   ("recommended",  "ml", "tensorflow.org/tutorials — start with the beginner quickstart"),
    "PyTorch":      ("recommended",  "ml", "pytorch.org/tutorials — 60-minute blitz"),
    "Pandas":       ("critical",     "ml", "pandas.pydata.org/docs/getting_started — 10-minute intro"),
    "NumPy":        ("critical",     "ml", "numpy.org/learn — absolute beginners guide"),
    "Scikit-learn": ("recommended",  "ml", "scikit-learn.org/stable/getting_started — user guide"),
    "LLMs":         ("recommended",  "ml", "Andrej Karpathy's 'Neural Networks: Zero to Hero' on YouTube"),

    # ── Tools / practices ──────────────────────────────────────────────────────
    "Git":          ("critical",     "tools", "git-scm.com/book — Pro Git book, free online"),
    "GitHub":       ("critical",     "tools", "github.com/skills — interactive courses in your browser"),
    "Agile":        ("recommended",  "tools", "Scrum Guide (scrumguides.org) — free, 13 pages"),
    "Scrum":        ("recommended",  "tools", "Scrum Guide + take a free PSM I practice test"),
    "System Design":("critical",     "tools", "'Designing Data-Intensive Applications' + system-design-primer on GitHub"),
    "Microservices":("recommended",  "tools", "'Building Microservices' by Sam Newman — chapters 1-4 first"),
    "Testing":      ("recommended",  "tools", "Learn pytest (Python) or Jest (JS) by writing tests for an existing project"),
    "Jest":         ("recommended",  "tools", "jestjs.io/docs/getting-started — then TDD a small feature"),
    "Pytest":       ("recommended",  "tools", "docs.pytest.org/getting-started"),

    # ── Soft skills / formats ──────────────────────────────────────────────────
    "Communication":("recommended",  "soft", "Toastmasters or 'Crucial Conversations' book"),
    "Leadership":   ("nice-to-have", "soft", "Take on a tech lead role in a side project or open source"),
}

# Normalised lookup: lowercase → canonical display name
_SKILL_LOWER: dict[str, str] = {k.lower(): k for k in SKILL_DB}

# Aliases so common abbreviations / alternate spellings still match
_ALIASES: dict[str, str] = {
    "js":           "JavaScript",
    "javascript":   "JavaScript",
    "ts":           "TypeScript",
    "typescript":   "TypeScript",
    "node":         "Node.js",
    "nodejs":       "Node.js",
    "vue":          "Vue.js",
    "vuejs":        "Vue.js",
    "react.js":     "React",
    "reactjs":      "React",
    "nextjs":       "Next.js",
    "next":         "Next.js",
    "tailwind":     "Tailwind CSS",
    "postgres":     "PostgreSQL",
    "postgresql":   "PostgreSQL",
    "mongo":        "MongoDB",
    "elasticsearch":"Elasticsearch",
    "elastic":      "Elasticsearch",
    "k8s":          "Kubernetes",
    "kube":         "Kubernetes",
    "tf":           "Terraform",
    "ml":           "Machine Learning",
    "sklearn":      "Scikit-learn",
    "scikit":       "Scikit-learn",
    "np":           "NumPy",
    "numpy":        "NumPy",
    "pd":           "Pandas",
    "llm":          "LLMs",
    "large language model": "LLMs",
    "rest":         "REST APIs",
    "restful":      "REST APIs",
    "rest api":     "REST APIs",
    "rest apis":    "REST APIs",
    "ci/cd":        "CI/CD",
    "cicd":         "CI/CD",
    "continuous integration": "CI/CD",
    "aws":          "AWS",
    "amazon web services": "AWS",
    "gcp":          "GCP",
    "google cloud": "GCP",
    "azure":        "Azure",
    "microsoft azure": "Azure",
    "agile":        "Agile",
    "scrum":        "Scrum",
    "git":          "Git",
    "github":       "GitHub",
}


# Standard resume section headings
_SECTION_PATTERNS: dict[str, list[str]] = {
    "summary":     ["summary", "objective", "profile", "about", "overview", "introduction"],
    "experience":  ["experience", "work experience", "employment", "work history",
                    "professional experience", "career history", "positions held"],
    "education":   ["education", "academic", "qualifications", "degree", "university",
                    "schooling", "certifications", "training"],
    "skills":      ["skills", "technical skills", "core competencies", "technologies",
                    "competencies", "expertise", "tech stack", "tools"],
    "projects":    ["projects", "personal projects", "open source", "portfolio",
                    "side projects", "notable projects"],
    "achievements":["achievements", "accomplishments", "awards", "honours", "honors",
                    "recognition"],
    "contact":     ["contact", "email", "phone", "linkedin", "github", "location",
                    "address", "website", "portfolio"],
}


# ══════════════════════════════════════════════════════════════════════════════
# 2. INTERNAL DATA STRUCTURES
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class ResumeProfile:
    """Intermediate analysis state — not exposed over the API."""
    text: str
    text_lower: str = field(init=False)
    lines: list[str] = field(init=False)
    sections_found: set[str] = field(default_factory=set)
    extracted_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    has_bullet_points: bool = False
    has_dates: bool = False
    has_metrics: bool = False
    has_action_verbs: bool = False
    word_count: int = 0

    def __post_init__(self) -> None:
        self.text_lower = self.text.lower()
        self.lines = [ln.strip() for ln in self.text.splitlines() if ln.strip()]
        self.word_count = len(self.text.split())


# ══════════════════════════════════════════════════════════════════════════════
# 3. SECTION DETECTOR
# ══════════════════════════════════════════════════════════════════════════════

def _detect_sections(profile: ResumeProfile) -> None:
    for section, keywords in _SECTION_PATTERNS.items():
        for kw in keywords:
            if re.search(rf"\b{re.escape(kw)}\b", profile.text_lower):
                profile.sections_found.add(section)
                break


# ══════════════════════════════════════════════════════════════════════════════
# 4. SKILL EXTRACTOR
# ══════════════════════════════════════════════════════════════════════════════

def _extract_skills(profile: ResumeProfile) -> None:
    """
    Match skills against the text using whole-word regex so 'Go' doesn't
    match inside 'Django', etc.
    """
    found: set[str] = set()
    text = profile.text_lower

    # Check aliases first (longer phrases before shorter ones to avoid partial clobber)
    for alias in sorted(_ALIASES, key=len, reverse=True):
        if re.search(rf"\b{re.escape(alias)}\b", text):
            canonical = _ALIASES[alias]
            found.add(canonical)

    # Then direct skill name matching
    for skill_lower, canonical in _SKILL_LOWER.items():
        if canonical in found:
            continue  # already matched via alias
        # Escape dots in e.g. "node.js"
        pattern = rf"\b{re.escape(skill_lower)}\b"
        if re.search(pattern, text):
            found.add(canonical)

    profile.extracted_skills = sorted(found)

    # Missing = everything in the DB not found
    profile.missing_skills = sorted(
        skill for skill in SKILL_DB if skill not in found
    )


# ══════════════════════════════════════════════════════════════════════════════
# 5. FORMAT SIGNAL DETECTOR
# ══════════════════════════════════════════════════════════════════════════════

_DATE_RE = re.compile(
    r"\b("
    r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*"
    r"|\d{4}"
    r"|present|current|now"
    r")\b",
    re.IGNORECASE,
)

_METRIC_RE = re.compile(
    r"(\d+\s*%"               # percentages
    r"|\$\s*\d+"              # dollar amounts
    r"|\d+x\b"                # multipliers
    r"|\d+\s*(million|thousand|k\b|users|customers|requests|deployments|"
    r"engineers|members|projects|services|repos|commits|tickets|ms\b|"
    r"seconds|minutes|hours|days|weeks))",
    re.IGNORECASE,
)

_ACTION_VERBS = {
    "built", "designed", "developed", "implemented", "led", "managed",
    "created", "architected", "optimised", "optimized", "improved",
    "reduced", "increased", "launched", "deployed", "delivered",
    "collaborated", "mentored", "automated", "refactored", "migrated",
    "integrated", "scaled", "established", "streamlined", "spearheaded",
    "engineered", "shipped", "authored", "maintained", "owned",
}

def _detect_format_signals(profile: ResumeProfile) -> None:
    profile.has_bullet_points = bool(
        re.search(r"^[\-\•\*\u2022\u25CF\u2013]", profile.text, re.MULTILINE)
    )
    profile.has_dates = bool(_DATE_RE.search(profile.text))
    profile.has_metrics = bool(_METRIC_RE.search(profile.text))

    first_words = {
        ln.split()[0].lower().rstrip(".,;:")
        for ln in profile.lines
        if ln.split()
    }
    profile.has_action_verbs = bool(first_words & _ACTION_VERBS)


# ══════════════════════════════════════════════════════════════════════════════
# 6. ATS SCORER
# ══════════════════════════════════════════════════════════════════════════════

# ATS systems weight critical skills heavily — these are the baseline keywords
# that almost every tech JD demands.
_CRITICAL_SKILLS = {
    s for s, (imp, *_) in SKILL_DB.items() if imp == "critical"
}

def _score_keyword_match(profile: ResumeProfile) -> int:
    """
    Score = (critical skills found / all critical skills) weighted 70%
          + (any skills found / total skills)            weighted 30%
    """
    found = set(profile.extracted_skills)
    critical_found = found & _CRITICAL_SKILLS
    critical_ratio = len(critical_found) / max(len(_CRITICAL_SKILLS), 1)
    total_ratio    = len(found) / max(len(SKILL_DB), 1)
    raw = (critical_ratio * 0.70 + total_ratio * 0.30) * 100
    # Clamp: even an empty skill section scores at least 5
    return max(5, min(100, round(raw)))


def _score_format(profile: ResumeProfile) -> int:
    score = 40  # baseline
    if profile.has_bullet_points: score += 20
    if profile.has_dates:         score += 15
    if profile.has_metrics:       score += 15
    if profile.has_action_verbs:  score += 10
    # Reasonable length check: most ATS expect 300-800 words for 1-2 pages
    if 300 <= profile.word_count <= 800:
        score += 5
    elif profile.word_count > 800:
        score -= 5  # too long — ATS may truncate
    return max(0, min(100, score))


def _score_sections(profile: ResumeProfile) -> int:
    weights = {
        "contact":     15,
        "experience":  30,
        "education":   20,
        "skills":      20,
        "summary":     10,
        "projects":     5,
    }
    return sum(
        w for section, w in weights.items()
        if section in profile.sections_found
    )


def _compute_ats(profile: ResumeProfile) -> tuple[int, ATSBreakdown]:
    kw    = _score_keyword_match(profile)
    fmt   = _score_format(profile)
    sects = _score_sections(profile)

    # Weighted composite: keywords matter most for ATS pass/fail
    composite = round(kw * 0.45 + fmt * 0.25 + sects * 0.30)
    composite = max(0, min(100, composite))

    return composite, ATSBreakdown(
        keyword_match=kw,
        format_score=fmt,
        section_completeness=sects,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 7. SKILL GAP ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

# How many gaps to surface per importance tier
_GAP_LIMITS = {"critical": 4, "recommended": 3, "nice-to-have": 2}

def _build_skill_gaps(profile: ResumeProfile) -> list[SkillGap]:
    counts: dict[str, int] = {"critical": 0, "recommended": 0, "nice-to-have": 0}
    gaps: list[SkillGap] = []

    for skill in profile.missing_skills:
        importance, _domain, how = SKILL_DB[skill]
        if counts[importance] >= _GAP_LIMITS[importance]:
            continue
        gaps.append(SkillGap(skill=skill, importance=importance, how_to_learn=how))
        counts[importance] += 1

    # Surface: critical first, then recommended, then nice-to-have
    order = {"critical": 0, "recommended": 1, "nice-to-have": 2}
    return sorted(gaps, key=lambda g: order[g.importance])


# ══════════════════════════════════════════════════════════════════════════════
# 8. SUGGESTION ENGINE
# ══════════════════════════════════════════════════════════════════════════════

def _build_suggestions(profile: ResumeProfile, ats_score: int) -> list[Suggestion]:
    suggestions: list[Suggestion] = []

    # ── Impact / metrics ──────────────────────────────────────────────────────
    if not profile.has_metrics:
        suggestions.append(Suggestion(
            category="impact",
            priority="high",
            suggestion=(
                "Add measurable results to every experience bullet. "
                "Numbers make your impact concrete and differentiate you from candidates with similar titles."
            ),
            example=(
                "Instead of 'Improved API performance' → "
                "'Reduced API response time by 35%, from 480 ms to 310 ms, serving 2 M daily requests'"
            ),
        ))

    if not profile.has_action_verbs:
        suggestions.append(Suggestion(
            category="impact",
            priority="high",
            suggestion=(
                "Start every bullet point with a strong past-tense action verb. "
                "ATS and recruiters both respond better to active, concrete language."
            ),
            example="Built · Designed · Reduced · Launched · Mentored · Automated · Delivered",
        ))

    # ── Missing summary section ────────────────────────────────────────────────
    if "summary" not in profile.sections_found:
        suggestions.append(Suggestion(
            category="content",
            priority="high",
            suggestion=(
                "Add a 2–3 sentence professional summary at the very top of your resume. "
                "Many ATS systems extract this as the first data point and recruiters read it in under 10 seconds."
            ),
            example=(
                "Full-stack engineer with 4 years of experience building scalable React and "
                "Node.js applications. Proven track record of reducing infrastructure costs and "
                "improving system reliability. Seeking a senior role in a product-led team."
            ),
        ))

    # ── Missing critical sections ──────────────────────────────────────────────
    for section in ("experience", "education", "skills"):
        if section not in profile.sections_found:
            suggestions.append(Suggestion(
                category="content",
                priority="high",
                suggestion=(
                    f"Add a clearly labelled '{section.title()}' section. "
                    "ATS parsers look for these exact headings — without them your resume may be scored 0 "
                    "for that dimension even if the content exists in the file."
                ),
            ))

    # ── Missing projects section ────────────────────────────────────────────────
    if "projects" not in profile.sections_found:
        suggestions.append(Suggestion(
            category="content",
            priority="medium",
            suggestion=(
                "Add a Projects section with 2–3 entries linking to live demos or GitHub repos. "
                "This is the single highest-ROI addition for engineers with under 5 years of experience."
            ),
        ))

    # ── Format: bullet points ──────────────────────────────────────────────────
    if not profile.has_bullet_points:
        suggestions.append(Suggestion(
            category="format",
            priority="high",
            suggestion=(
                "Use bullet points for all experience descriptions. "
                "Dense paragraphs are hard for both ATS parsers and human reviewers to scan."
            ),
        ))

    # ── Format: dates ─────────────────────────────────────────────────────────
    if not profile.has_dates:
        suggestions.append(Suggestion(
            category="format",
            priority="medium",
            suggestion=(
                "Add clear date ranges (e.g. 'Jan 2021 – Mar 2024') to every role and degree. "
                "Missing dates are a top ATS red flag and raise questions for recruiters."
            ),
            example="Software Engineer · Acme Corp · Jan 2022 – Present",
        ))

    # ── Keywords: missing critical skills ─────────────────────────────────────
    critical_missing = [
        s for s in profile.missing_skills
        if SKILL_DB[s][0] == "critical"
    ][:4]
    if critical_missing:
        skill_list = ", ".join(critical_missing)
        suggestions.append(Suggestion(
            category="keywords",
            priority="high",
            suggestion=(
                f"These high-value keywords are absent from your resume: {skill_list}. "
                "If you have experience with any of them, add them explicitly — ATS systems require "
                "exact keyword matches, not inferred knowledge."
            ),
        ))

    # ── Low overall ATS score ─────────────────────────────────────────────────
    if ats_score < 50:
        suggestions.append(Suggestion(
            category="keywords",
            priority="high",
            suggestion=(
                "Your ATS score is below 50. The fastest way to improve it: "
                "copy the exact phrasing of skills from 3 target job descriptions "
                "and mirror that language in your resume's Skills and Experience sections."
            ),
        ))
    elif ats_score < 70:
        suggestions.append(Suggestion(
            category="keywords",
            priority="medium",
            suggestion=(
                "Tailor your Skills section to each job application by adding 3–5 keywords "
                "from the specific job description. This alone can push an ATS score above 75."
            ),
        ))

    # Sort: high → medium → low, then by category importance
    order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda s: order[s.priority])
    return suggestions


# ══════════════════════════════════════════════════════════════════════════════
# 9. SUMMARY BUILDER
# ══════════════════════════════════════════════════════════════════════════════

def _build_summary(profile: ResumeProfile, ats_score: int) -> str:
    found   = profile.extracted_skills
    missing = profile.missing_skills
    sections = profile.sections_found

    # Characterise strength
    if ats_score >= 80:
        strength = "strong"
    elif ats_score >= 60:
        strength = "moderate"
    else:
        strength = "developing"

    # Top present skills (up to 4)
    skill_phrase = ""
    if found:
        top = found[:4]
        if len(top) == 1:
            skill_phrase = f" in {top[0]}"
        else:
            skill_phrase = f" across {', '.join(top[:-1])} and {top[-1]}"

    # Top missing critical skills (up to 3)
    critical_gaps = [s for s in missing if SKILL_DB[s][0] == "critical"][:3]
    gap_phrase = ""
    if critical_gaps:
        gap_phrase = (
            f" Key gaps to address are {', '.join(critical_gaps)}, "
            "which appear in the majority of senior technical job descriptions."
        )

    # Section completeness note
    missing_sections = {"summary", "experience", "skills", "projects"} - sections
    section_note = ""
    if missing_sections:
        names = " and ".join(s.title() for s in sorted(missing_sections))
        section_note = f" Adding a {names} section would meaningfully improve your ATS score."

    # Metrics note
    metrics_note = (
        "" if profile.has_metrics
        else " Quantifying your achievements with specific metrics would significantly strengthen your impact statements."
    )

    return (
        f"Your resume shows a {strength} technical profile{skill_phrase}, "
        f"scoring {ats_score}/100 for ATS compatibility."
        f"{gap_phrase}"
        f"{section_note}"
        f"{metrics_note}"
    ).strip()


# ══════════════════════════════════════════════════════════════════════════════
# 10. PUBLIC ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def analyze_resume_text(
    text: str,
    job_description: str | None = None,  # reserved for future JD-aware scoring
) -> AnalysisResult:
    """
    Run the full rule-based analysis pipeline and return an AnalysisResult
    ready to be serialised and sent to the Next.js frontend.
    """
    profile = ResumeProfile(text=text)

    _detect_sections(profile)
    _extract_skills(profile)
    _detect_format_signals(profile)

    ats_score, breakdown = _compute_ats(profile)
    skill_gaps  = _build_skill_gaps(profile)
    suggestions = _build_suggestions(profile, ats_score)
    summary     = _build_summary(profile, ats_score)

    return AnalysisResult(
        ats_score=ats_score,
        ats_breakdown=breakdown,
        extracted_skills=profile.extracted_skills,
        missing_skills=profile.missing_skills,
        skill_gap_analysis=skill_gaps,
        suggestions=suggestions,
        summary=summary,
    )

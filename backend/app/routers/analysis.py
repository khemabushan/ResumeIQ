"""
Analysis router.

POST /analyze/sync  — Upload PDF → extract text → rule-based analysis → AnalysisResult
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import settings
from app.models.schemas import AnalysisResult, ErrorResponse
from app.services.analyzer import analyze_resume_text
from app.services.pdf_extractor import extract_text_from_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analysis"])

_ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}


def _validate_upload(file: UploadFile) -> None:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in _ALLOWED_CONTENT_TYPES:
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only PDF files are accepted. Please upload a .pdf file.",
            )


@router.post(
    "/sync",
    response_model=AnalysisResult,
    responses={
        415: {"model": ErrorResponse, "description": "Unsupported file type"},
        413: {"model": ErrorResponse, "description": "File too large"},
        422: {"model": ErrorResponse, "description": "Could not process file"},
    },
    summary="Upload a resume PDF and return full ATS analysis",
)
async def analyze_sync(
    file: UploadFile = File(..., description="PDF resume file"),
    job_description: str | None = Form(
        default=None,
        description="Optional job description for targeted skill gap analysis",
    ),
) -> AnalysisResult:
    # 1. Validate ──────────────────────────────────────────────────────────────
    _validate_upload(file)

    pdf_bytes = await file.read()

    if len(pdf_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded file is empty.",
        )
    if len(pdf_bytes) > settings.max_upload_bytes:
        max_mb = settings.max_upload_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {max_mb} MB limit.",
        )

    # 2. Extract text ──────────────────────────────────────────────────────────
    filename = file.filename or "resume.pdf"
    logger.info("Processing '%s' (%d bytes)", filename, len(pdf_bytes))

    try:
        extracted = extract_text_from_bytes(pdf_bytes, filename=filename)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    # 3. Analyse ───────────────────────────────────────────────────────────────
    result = analyze_resume_text(extracted.text, job_description=job_description)

    logger.info(
        "'%s' → ATS %d | skills found: %d | suggestions: %d",
        filename,
        result.ats_score,
        len(result.extracted_skills),
        len(result.suggestions),
    )
    return result

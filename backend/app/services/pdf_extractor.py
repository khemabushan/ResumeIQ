"""
PDF text extraction service using pdfplumber.

Strategy
--------
1. Open the PDF and iterate page by page.
2. Extract text with layout-aware settings so columns and tables are readable.
3. Detect pages that yielded no text (likely scanned images) and record a warning.
4. Return the joined text along with metadata.
"""

from __future__ import annotations

import io
import re

import pdfplumber

from app.models.schemas import ExtractedResume


# Characters that look like text but are encoding artefacts — strip them.
_GARBAGE_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean(raw: str) -> str:
    """Remove control characters and normalise whitespace."""
    text = _GARBAGE_RE.sub("", raw)
    # Collapse runs of 3+ blank lines to two
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text_from_bytes(pdf_bytes: bytes, filename: str = "upload.pdf") -> ExtractedResume:
    """
    Extract plain text from raw PDF bytes.

    Parameters
    ----------
    pdf_bytes:  Raw bytes of the uploaded PDF file.
    filename:   Original filename — used only for warning messages.

    Returns
    -------
    ExtractedResume with text, page count, word/char counts, and warnings.

    Raises
    ------
    ValueError  If the file cannot be opened as a PDF or yields no text at all.
    """
    warnings: list[str] = []
    page_texts: list[str] = []

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            page_count = len(pdf.pages)

            if page_count == 0:
                raise ValueError("The PDF has no pages.")

            for page_num, page in enumerate(pdf.pages, start=1):
                # x_tolerance / y_tolerance control how aggressively pdfplumber
                # merges nearby characters.  Tighter horizontal tolerance helps
                # with multi-column layouts; looser vertical tolerance handles
                # resumes with small line gaps.
                raw = page.extract_text(x_tolerance=2, y_tolerance=4)

                if not raw or not raw.strip():
                    warnings.append(
                        f"Page {page_num} yielded no text — it may be a scanned image. "
                        "Consider OCR pre-processing for best results."
                    )
                    continue

                page_texts.append(_clean(raw))

    except pdfplumber.pdfminer.pdfparser.PDFSyntaxError as exc:
        raise ValueError(f"Could not parse '{filename}' as a valid PDF: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        # Re-raise unexpected errors with context
        raise ValueError(f"Failed to read '{filename}': {exc}") from exc

    full_text = "\n\n".join(page_texts)

    if not full_text.strip():
        raise ValueError(
            "No text could be extracted from the PDF. "
            "The document may consist entirely of scanned images. "
            "Please upload a text-based PDF."
        )

    word_count = len(full_text.split())
    char_count = len(full_text)

    return ExtractedResume(
        text=full_text,
        page_count=page_count,
        word_count=word_count,
        char_count=char_count,
        extraction_warnings=warnings,
    )

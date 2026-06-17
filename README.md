# ResumeIQ

ResumeIQ is an AI-powered resume analysis platform that evaluates resumes for ATS (Applicant Tracking System) compatibility and provides actionable suggestions for improvement.

## Features

- ATS Score Calculation
- Resume Skill Extraction
- Missing Skills Detection
- Skill Gap Analysis
- Resume Improvement Suggestions
- PDF Resume Upload
- Modern Responsive UI

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- FastAPI
- Python
- Pydantic
- PDFPlumber

## Project Structure

ResumeIQ
├── frontend
└── backend

## Installation

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Upload a PDF resume.
2. Analyze the resume.
3. View ATS score, missing skills, and recommendations.

## Live Demo

Frontend:
https://resumeiq-frontend-rjvj.onrender.com

Backend API:
https://resumeiq-api-n8ln.onrender.com/docs

## Author

Hemabushan K  
B.Tech CSE (AI & ML)

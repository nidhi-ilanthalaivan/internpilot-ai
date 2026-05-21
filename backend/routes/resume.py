from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import fitz
import sys

from models.resume_schema import ResumeData
from services.resume_parser import parse_resume
from services.job_parser import parse_job_description
from services.matcher import calculate_compatibility
from models.job_schema import JobRequirements
from models.match_schema import CompatibilityScore
from services.interview_generator import generate_tailored_questions
from models.interview_schema import InterviewSessionPrep
from services.evaluation_engine import evaluate_candidate_answer
from models.evaluation_schema import AnswerEvaluation



from database.config import get_db
from database.models import ResumeTable, JobMatchTable

router = APIRouter(prefix="/resume", tags=["Resume"])

class MatchRequest(BaseModel):
    resume_data: ResumeData
    job_description_text: str

class PrepRequest(BaseModel):
    job_title: str
    match_report: CompatibilityScore

class EvaluationRequest(BaseModel):
    question_text: str
    focus_area: str
    user_answer_text: str

@router.post("/upload", response_model=ResumeData)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()

        pdf = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text()

        if not text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text. The PDF might be scanned or empty."
            )

        structured_data = parse_resume(text)

       
        db_resume = ResumeTable(
            filename=file.filename,
            skills=structured_data.skills,
            projects=structured_data.projects,
            experience=structured_data.experience,
            education=structured_data.education
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        return structured_data

    except Exception as e:
        print(f"💥 BACKEND CRASH ERROR (UPLOAD): {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@router.post("/match", response_model=CompatibilityScore)
async def match_resume_to_job(payload: MatchRequest, db: Session = Depends(get_db)):
    try:
        
        parsed_job = parse_job_description(payload.job_description_text)
        
        match_report = calculate_compatibility(payload.resume_data, parsed_job)
        
       
        db_match = JobMatchTable(
            company=parsed_job.company,
            job_title=parsed_job.title,
            match_percentage=match_report.match_percentage,
            matched_skills=match_report.matched_skills,
            missing_skills=match_report.missing_skills,
            feedback_summary=match_report.feedback_summary
        )
        db.add(db_match)
        db.commit()
        db.refresh(db_match)
        
        return match_report
        
    except Exception as e:
        print(f"💥 BACKEND CRASH ERROR (MATCH): {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Matching evaluation engine encountered an error: {str(e)}")
    

@router.post("/generate-interview", response_model=InterviewSessionPrep)
async def create_mock_interview(payload: PrepRequest):
    try:
        # Use our generator service to spin up the custom question collection
        interview_set = generate_tailored_questions(payload.job_title, payload.match_report)
        return interview_set
    except Exception as e:
        print(f"💥 BACKEND CRASH ERROR (INTERVIEW GEN): {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Interview engine failed to build set: {str(e)}")

@router.post("/evaluate-answer", response_model=AnswerEvaluation)
async def score_interview_answer(payload: EvaluationRequest):
    try:
        evaluation = evaluate_candidate_answer(
            question=payload.question_text,
            focus_area=payload.focus_area,
            candidate_answer=payload.user_answer_text
        )
        return evaluation
    except Exception as e:
        print(f"💥 BACKEND CRASH ERROR (EVAL): {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Evaluation engine failed: {str(e)}")
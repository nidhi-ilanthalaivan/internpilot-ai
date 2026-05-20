from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel 
import fitz
import sys

from models.resume_schema import ResumeData
from services.resume_parser import parse_resume
from services.job_parser import parse_job_description
from services.matcher import calculate_compatibility
from models.job_schema import JobRequirements
from models.match_schema import CompatibilityScore

router = APIRouter(prefix="/resume", tags=["Resume"])

class MatchRequest(BaseModel):
    resume_data: ResumeData
    job_description_text: str

@router.post("/upload", response_model=ResumeData)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()

        pdf = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text()

        # empty/scanned PDF exceptions
        if not text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text. The PDF might be scanned or empty."
            )

        # send the clean text to Gemini and get back structured pydantic data
        structured_data = parse_resume(text)

        # return the pydantic model directly
        return structured_data

    
    except Exception as e:
        print(f"💥 BACKEND CRASH ERROR (UPLOAD): {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@router.post("/match", response_model=CompatibilityScore)
async def match_resume_to_job(payload: MatchRequest):
    try:
        # parse incoming messy job description text using Gemini
        parsed_job = parse_job_description(payload.job_description_text)
        
        # compare the pre-parsed resume data against the fresh job metadata
        match_report = calculate_compatibility(payload.resume_data, parsed_job)
        
        return match_report
    except Exception as e:
        print(f"💥 BACKEND CRASH ERROR (MATCH): {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Matching evaluation engine encountered an error: {str(e)}")
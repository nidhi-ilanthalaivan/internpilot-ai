from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz

from models.resume_schema import ResumeData
from services.resume_parser import parse_resume

router = APIRouter()


router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeData)
async def upload_resume(file: UploadFile = File(...)):
    # check if pdf
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()

        # extract text
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

        #send the clean text to gemini and get back structured pydantic data
        structured_data = parse_resume(text)

        # return the verified Pydantic model directly
        return structured_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")
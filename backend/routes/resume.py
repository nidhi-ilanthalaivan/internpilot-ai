from fastapi import APIRouter, UploadFile, File
import fitz

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()

    pdf = fitz.open(stream=contents, filetype="pdf")

    text = ""

    for page in pdf:
        text += page.get_text()

    return {"resume_text": text[:5000]}
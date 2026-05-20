import os
import google.generativeai as genai
from dotenv import load_dotenv
from models.resume_schema import ResumeData

load_dotenv()

# gemini API key configuration
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def parse_resume(resume_text: str) -> ResumeData:
    """
    Parses raw resume text and uses Gemini's native structured output 
    to guarantee a valid Pydantic response matching ResumeData.
    """
    prompt = f"""
    You are an expert ATS data extraction system.
    Extract structured information from the provided resume text.
    
    Resume Text:
    {resume_text}
    """

    # enforce the JSON schema via pydantic
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=ResumeData
        )
    )


    validated_data = ResumeData.model_validate_json(response.text)
    
    return validated_data
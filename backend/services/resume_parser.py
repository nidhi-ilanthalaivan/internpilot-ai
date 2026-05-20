import os
import json
from google import genai
from dotenv import load_dotenv
from models.resume_schema import ResumeData

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ GEMINI_API_KEY is missing! Double check your backend/.env file.")

client = genai.Client(api_key=api_key)

def parse_resume(resume_text: str) -> ResumeData:
    """
    Parses raw resume text into structured Pydantic data by enforcing JSON formatting 
    via prompt engineering and validating it with local Pydantic models.
    """
    
    prompt = f"""
    You are an expert ATS data extraction system.
    Extract structured information from the provided resume text.
    
    Return your output strictly as a valid JSON object. Do not include markdown code block formatting (like ```json).
    
    Expected JSON Format:
    {{
      "skills": ["skill1", "skill2"],
      "projects": ["project1", "project2"],
      "experience": ["experience1", "experience2"],
      "education": ["education1", "education2"]
    }}
    
    Resume Text:
    {resume_text}
    """

    
    response = client.models.generate_content(
        model="gemini-1.5-flash", 
        contents=prompt
    )

    # clean up the string just in case the model wraps it in markdown blocks
    raw_text = response.text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        # convert the raw string to python dictionary
        parsed_json = json.loads(raw_text)
        
        # enforce and validate schema consistency using your local pydantic model
        validated_data = ResumeData(**parsed_json)
        return validated_data
        
    except Exception as parse_error:
        print(f"Failed to parse or validate JSON raw output: {raw_text}")
        raise parse_error
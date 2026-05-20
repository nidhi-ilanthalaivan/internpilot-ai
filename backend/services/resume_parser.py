import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.resume_schema import ResumeData

load_dotenv()

client = genai.Client()

def parse_resume(resume_text: str) -> ResumeData:
    """
    Parses raw resume text using the modern google-genai SDK 
    with native Pydantic structured output validation.
    """
    prompt = f"""
    You are an expert ATS data extraction system.
    Extract structured information from the provided resume text.
    
    Resume Text:
    {resume_text}
    """

    # Using client.models.generate_content with the new structured config format
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResumeData,
        ),
    )

    # Convert the guaranteed clean JSON text directly into your Pydantic model
    validated_data = ResumeData.model_validate_json(response.text)
    
    return validated_data
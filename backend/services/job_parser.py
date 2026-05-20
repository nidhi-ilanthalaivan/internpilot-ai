import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.job_schema import JobRequirements

load_dotenv()

client = genai.Client()

def parse_job_description(jd_text: str) -> JobRequirements:
    """
    Parses a messy job description string and returns clean, 
    structured requirements using Gemini's native schema config.
    """
    prompt = f"""
    You are an expert technical recruiting coordinator. Analyze the following job description text.
    Extract the core details and structure them perfectly into the required schema.
    
    Job Description Text:
    {jd_text}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=JobRequirements,
        ),
    )

    return JobRequirements.model_validate_json(response.text)
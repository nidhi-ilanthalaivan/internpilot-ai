import os
from google import genai
from google.genai import types
from models.resume_schema import ResumeData
from models.job_schema import JobRequirements
from models.match_schema import CompatibilityScore

client = genai.Client()

def calculate_compatibility(resume: ResumeData, job: JobRequirements) -> CompatibilityScore:
    """
    Compares structured resume data against job requirements 
    to output an analytical matching evaluation.
    """
    prompt = f"""
    You are an advanced talent acquisition analytics engine. 
    Compare the candidate's structured resume data against the job requirements.
    
    Calculate a comprehensive match percentage (0 to 100).
    Identify which skills from the job description are present in the resume.
    Identify missing critical tech stacks or skills.
    Provide a concise, engineering-focused action item list for preparation.
    
    Candidate Resume Data:
    {resume.model_dump_json()}
    
    Target Job Requirements:
    {job.model_dump_json()}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=CompatibilityScore,
        ),
    )

    return CompatibilityScore.model_validate_json(response.text)
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.interview_schema import InterviewSessionPrep
from models.match_schema import CompatibilityScore

load_dotenv()
client = genai.Client()

def generate_tailored_questions(job_title: str, match_report: CompatibilityScore) -> InterviewSessionPrep:
    """
    Generates snappy, voice-optimized interview questions balancing the job's core requirements
    with the candidate's identified skill gaps.
    """
    
    # Safely stringify skills context for the LLM
    missing_context = ", ".join(match_report.missing_skills) if match_report.missing_skills else "None"
    matched_context = ", ".join(match_report.matched_skills) if match_report.matched_skills else "General technical skills"
    
    prompt = f"""
    You are an expert technical interviewer roleplaying a real-time voice interview for a {job_title} position.
    
    Candidate's Strengths (from resume): [{matched_context}]
    Candidate's Missing Gaps (from job description): [{missing_context}]
    
    Generate exactly 3 concise, conversational interview questions.
    
    CRITICAL VOICE DESIGN RULES:
    1. Every question must be ultra-short (1 to 2 sentences maximum).
    2. Do NOT ask broad essay or multi-part project architectural questions.
    3. Speak directly to the candidate as if you are in a live Zoom or phone call.
    
    DISTRIBUTION RULES:
    - Question 1 (Technical Baseline): Test one of their existing strengths from their resume.
    - Question 2 (Technical Challenge): Snappily test their adaptability regarding one of their missing skill gaps.
    - Question 3 (Behavioral / Growth): Ask a behavioral question about handling production pressure or picking up a new stack.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=InterviewSessionPrep,
            ),
        )
        return InterviewSessionPrep.model_validate_json(response.text)
    except Exception as e:
        print(f"⚠️ Gemini 2.5-flash busy on interview gen, falling back to 1.5-flash: {str(e)}")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=InterviewSessionPrep,
            ),
        )
        return InterviewSessionPrep.model_validate_json(response.text)
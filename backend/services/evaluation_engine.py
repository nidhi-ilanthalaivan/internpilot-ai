import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.evaluation_schema import AnswerEvaluation

load_dotenv()
client = genai.Client()

def evaluate_candidate_answer(question: str, focus_area: str, candidate_answer: str) -> AnswerEvaluation:
    """
    Evaluates a response using tight structural boundaries to prevent text walls 
    and maximize dashboard scannability.
    """
    prompt = f"""
    You are an elite, direct tech interviewer. Grade this mock interview response.
    
    Context:
    - Question Asked: "{question}"
    - Focus Area: {focus_area}
    - Candidate's Answer: "{candidate_answer}"
    
    DESIGN RULES for your JSON response:
    1. Score strictly out of 100.
    2. "strengths": Return EXACTLY 2 short, punchy bullet points max.
    3. "weaknesses": Return EXACTLY 2 short, punchy bullet points max.
    4. "constructive_feedback": Keep this to EXACTLY 1 clear, actionable coaching sentence.
    5. "ideal_answer_alternative": Write a tight, conversational 3-sentence example answer.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnswerEvaluation,
            ),
        )
        return AnswerEvaluation.model_validate_json(response.text)
    except Exception as e:
        print(f"汇 Gemini 2.5-flash busy on evaluation, falling back to 1.5-flash: {str(e)}")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnswerEvaluation,
            ),
        )
        return AnswerEvaluation.model_validate_json(response.text)
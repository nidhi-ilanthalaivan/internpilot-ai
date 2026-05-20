from pydantic import BaseModel
from typing import List

class GeneratedQuestion(BaseModel):
    id: int
    question: str
    category: str  # "Technical" or "Behavioral"
    target_skill: str  # e.g., "Kubernetes"
    ideal_answer_keywords: List[str]

class InterviewSessionPrep(BaseModel):
    job_title: str
    questions: List[GeneratedQuestion]
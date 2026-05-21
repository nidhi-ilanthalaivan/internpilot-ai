from pydantic import BaseModel
from typing import List

class AnswerEvaluation(BaseModel):
    score: int  # Scale of 0 to 100
    strengths: List[str]
    weaknesses: List[str]
    constructive_feedback: str
    ideal_answer_alternative: str
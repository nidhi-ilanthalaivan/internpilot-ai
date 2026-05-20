from pydantic import BaseModel
from typing import List

class CompatibilityScore(BaseModel):
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    feedback_summary: str
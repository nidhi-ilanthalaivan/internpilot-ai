from pydantic import BaseModel
from typing import List

class JobRequirements(BaseModel):
    title: str
    company: str
    required_skills: List[str]
    preferred_skills: List[str]
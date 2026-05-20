from pydantic import BaseModel
from typing import List

class ResumeData(BaseModel):
    skills: List[str]
    projects: List[str]
    experience: List[str]
    education: List[str]
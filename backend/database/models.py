from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from datetime import datetime
from .config import Base

class ResumeTable(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    
    # structured Pydantic fields stored directly as native JSON
    skills = Column(JSON, nullable=False)
    projects = Column(JSON, nullable=False)
    experience = Column(JSON, nullable=False)
    education = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class JobMatchTable(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    match_percentage = Column(Integer, nullable=False)
    
    # store matched/missing items and raw summary feedback
    matched_skills = Column(JSON, nullable=False)
    missing_skills = Column(JSON, nullable=False)
    feedback_summary = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class InternshipBase(BaseModel):
    internship_title: str
    company_name: str
    location: str
    is_remote: bool
    start_date: Optional[date] = None
    duration_months: Optional[int] = None
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    stipend_avg: Optional[int] = None

class InternshipCreate(InternshipBase):
    pass

class Internship(InternshipBase):
    id: int
    skills: Optional[List[str]] = None

    class Config:
        from_attributes = True

class CandidateSkills(BaseModel):
    skills: List[str]

class CandidateBase(BaseModel):
    name: str
    email: str
    father_income: Optional[float] = None
    preferred_location: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: int
    skills: Optional[List[str]] = None
    resume_path: Optional[str] = None
    income_certificate_path: Optional[str] = None

    class Config:
        from_attributes = True

from sqlalchemy import Column, Integer, String, Boolean, Date, Float, Text, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from pgvector.sqlalchemy import Vector
from database import Base

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    internship_title = Column(String)
    company_name = Column(String)
    location = Column(String)
    start_date = Column(Date)
    duration_months = Column(Integer)
    stipend_min = Column(Integer)
    stipend_max = Column(Integer)
    stipend_avg = Column(Integer)
    is_remote = Column(Boolean)
    skills = Column(ARRAY(Text))
    embedding = Column(Vector(384))

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    skills = Column(ARRAY(Text))
    father_income = Column(Float)
    preferred_location = Column(String)
    resume_path = Column(String)
    income_certificate_path = Column(String)

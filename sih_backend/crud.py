from sqlalchemy.orm import Session
from sqlalchemy import text
import numpy as np
from fastapi import HTTPException
import models
import schemas
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyPDFLoader
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel
from typing import List
import os

embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
llm = ChatGroq(api_key=GROQ_API_KEY, model_name="Gemma2-9b-It")

class SkillsOutput(BaseModel):
    skills: List[str]

def extract_skills_from_resume(file_path: str) -> List[str]:
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    resume_text = docs[0].page_content.replace("\n", " ")

    parser = PydanticOutputParser(pydantic_object=SkillsOutput)
    prompt = ChatPromptTemplate.from_template(
        """
        You are an expert HR assistant. Extract ONLY the technical and professional skills
        from the following resume text. Normalize them into a clean Python list.

        Resume:
        {resume_text}
        """
    )
    chain = prompt | llm.with_structured_output(SkillsOutput)
    skills_out = chain.invoke({"resume_text": resume_text})
    return skills_out.skills

def create_internship(db: Session, internship: schemas.InternshipCreate):
    text_for_embedding = internship.internship_title + " " + internship.company_name
    embedding = embedder.encode([text_for_embedding], convert_to_numpy=True)[0]
    
    db_internship = models.Internship(
        **internship.dict(),
        embedding=embedding
    )
    db.add(db_internship)
    db.commit()
    db.refresh(db_internship)
    return db_internship

def get_internships(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Internship).offset(skip).limit(limit).all()

def search_internships(db: Session, candidate_skills: schemas.CandidateSkills, limit: int = 5):
    candidate_text = " ".join(candidate_skills.skills)
    candidate_embedding = embedder.encode([candidate_text], convert_to_numpy=True)[0]
    
    cand_emb_str = "[" + ",".join([str(x) for x in candidate_embedding]) + "]"

    query = text("""
        SELECT id, internship_title, company_name, location, stipend_min, stipend_max,
               1 - (embedding <=> :cand_emb) AS similarity
        FROM internships
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> :cand_emb
        LIMIT :limit;
    """)
    
    results = db.execute(query, {"cand_emb": cand_emb_str, "limit": limit}).fetchall()
    return [row._asdict() for row in results]

def create_candidate(db: Session, candidate: schemas.CandidateCreate, resume_path: str, income_certificate_path: str):
    db_candidate = db.query(models.Candidate).filter(models.Candidate.email == candidate.email).first()
    
    skills = extract_skills_from_resume(resume_path)

    if db_candidate:
        update_data = candidate.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_candidate, key, value)
        
        db_candidate.skills = skills
        db_candidate.resume_path = resume_path
        db_candidate.income_certificate_path = income_certificate_path
    else:
        db_candidate = models.Candidate(
            **candidate.dict(),
            skills=skills,
            resume_path=resume_path,
            income_certificate_path=income_certificate_path
        )
        db.add(db_candidate)

    db.commit()
    db.refresh(db_candidate)
    return db_candidate

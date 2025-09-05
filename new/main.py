import os
import certifi
os.environ['SSL_CERT_FILE'] = certifi.where()
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_groq import ChatGroq
from sentence_transformers import SentenceTransformer

from sqlalchemy import create_engine, Column, String, Integer, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from pgvector.sqlalchemy import Vector

# ----------- Load Env Vars ----------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


# Force SSL for Neon
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



# ----------- Initialize FastAPI ----------
app = FastAPI()

# ----------- Models -----------
class SkillsOutput(BaseModel):
    skills: List[str]

class InternshipInput(BaseModel):
    internship_id: str
    title: str
    description: str
    skills: List[str]

class ResumeInput(BaseModel):
    applicant_id: str
    file_path: str

# ----------- Initialize LLM + Embeddings -----------
llm = ChatGroq(api_key=GROQ_API_KEY, model_name="Gemma2-9b-It")
embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# ----------- DB Setup (SQLAlchemy + Neon + pgvector) -----------
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class Internship(Base):
    __tablename__ = "internships"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    skills = Column(JSON)
    embedding = Column(Vector(384))  # all-MiniLM-L6-v2 → 384 dimensions

class Applicant(Base):
    __tablename__ = "applicants"
    id = Column(String, primary_key=True, index=True)
    skills = Column(JSON)
    embedding = Column(Vector(384))

Base.metadata.create_all(bind=engine)

# ----------- Helper Function (Resume Skill Extract) -----------
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

# ----------- Routes -----------

@app.get("/resume/skills")
def resume_skills(file_path: str):
    """
    Extract skills from resume PDF and return embeddings
    """
    skills = extract_skills_from_resume(file_path)
    skills_embeddings = embedder.encode(skills).tolist()
    return {"skills": skills, "embeddings": skills_embeddings}


@app.post("/admin/internship")
def internship_embeddings(data: InternshipInput):
    """
    Admin provides internship details + skills → store in NeonDB
    """
    session = SessionLocal()
    text_data = f"Title: {data.title}\nDescription: {data.description}\nSkills: {', '.join(data.skills)}"
    internship_embedding = embedder.encode(text_data).tolist()

    internship = Internship(
        id=data.internship_id,
        title=data.title,
        description=data.description,
        skills=data.skills,
        embedding=internship_embedding
    )
    session.merge(internship)  # upsert
    session.commit()
    session.close()

    return {
        "message": "Internship stored successfully",
        "internship_id": data.internship_id,
        "embedding": internship_embedding
    }


@app.post("/applicant/resume")
def applicant_resume(data: ResumeInput):
    """
    Applicant uploads resume → extract skills → store in NeonDB
    """
    session = SessionLocal()
    skills = extract_skills_from_resume(data.file_path)
    text_data = "Applicant Skills: " + ", ".join(skills)
    applicant_embedding = embedder.encode(text_data).tolist()

    applicant = Applicant(
        id=data.applicant_id,
        skills=skills,
        embedding=applicant_embedding
    )
    session.merge(applicant)
    session.commit()
    session.close()

    return {
        "message": "Applicant stored successfully",
        "applicant_id": data.applicant_id,
        "skills": skills,
        "embedding": applicant_embedding
    }


@app.get("/match/applicant/{applicant_id}")
def match_internships(applicant_id: str):
    """
    Match applicant with internships → return top 5
    """
    session = SessionLocal()
    applicant = session.query(Applicant).filter(Applicant.id == applicant_id).first()
    if not applicant:
        return {"error": "Applicant not found"}

    results = session.execute(
        f"""
        SELECT id, title, description, skills, embedding <=> :vec AS distance
        FROM internships
        ORDER BY embedding <=> :vec
        LIMIT 5
        """,
        {"vec": applicant.embedding}
    ).fetchall()
    session.close()

    return {"applicant_id": applicant_id, "top_matches": [dict(r) for r in results]}


@app.get("/match/internship/{internship_id}")
def match_applicants(internship_id: str):
    """
    Admin retrieves top 4 applicants for given internship
    """
    session = SessionLocal()
    internship = session.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        return {"error": "Internship not found"}

    results = session.execute(
        f"""
        SELECT id, skills, embedding <=> :vec AS distance
        FROM applicants
        ORDER BY embedding <=> :vec
        LIMIT 4
        """,
        {"vec": internship.embedding}
    ).fetchall()
    session.close()

    return {"internship_id": internship_id, "top_applicants": [dict(r) for r in results]}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

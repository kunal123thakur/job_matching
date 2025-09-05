# app.py
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from sentence_transformers import SentenceTransformer

# ----------- Load Env Vars ----------
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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

# ----------- Vector Stores -----------
internship_db = Chroma(collection_name="internships", embedding_function=embedder.encode)
applicant_db = Chroma(collection_name="applicants", embedding_function=embedder.encode)

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
    Admin provides internship details + skills → store embedding in DB
    """
    text_data = f"Title: {data.title}\nDescription: {data.description}\nSkills: {', '.join(data.skills)}"
    internship_embedding = embedder.encode(text_data).tolist()

    internship_db.add_texts(
        texts=[text_data],
        ids=[data.internship_id],
        metadatas=[{"title": data.title, "description": data.description, "skills": data.skills}]
    )

    return {
        "message": "Internship embedding stored successfully",
        "internship_id": data.internship_id,
        "embedding": internship_embedding
    }


@app.post("/applicant/resume")
def applicant_resume(data: ResumeInput):
    """
    Applicant uploads resume → extract skills → store embedding in DB
    """
    skills = extract_skills_from_resume(data.file_path)
    text_data = "Applicant Skills: " + ", ".join(skills)
    applicant_embedding = embedder.encode(text_data).tolist()

    applicant_db.add_texts(
        texts=[text_data],
        ids=[data.applicant_id],
        metadatas=[{"skills": skills}]
    )

    return {
        "message": "Applicant embedding stored successfully",
        "applicant_id": data.applicant_id,
        "skills": skills,
        "embedding": applicant_embedding
    }


@app.get("/match/applicant/{applicant_id}")
def match_internships(applicant_id: str):
    """
    Match applicant with internships → return top 5 internships
    """
    results = applicant_db.get(ids=[applicant_id])
    if not results["documents"]:
        return {"error": "Applicant not found"}

    applicant_text = results["documents"][0]
    query_embedding = embedder.encode(applicant_text)

    matches = internship_db.similarity_search_by_vector(query_embedding, k=5)
    return {"applicant_id": applicant_id, "top_matches": matches}


@app.get("/match/internship/{internship_id}")
def match_applicants(internship_id: str):
    """
    Admin retrieves top 4 applicants for given internship
    """
    results = internship_db.get(ids=[internship_id])
    if not results["documents"]:
        return {"error": "Internship not found"}

    internship_text = results["documents"][0]
    query_embedding = embedder.encode(internship_text)

    matches = applicant_db.similarity_search_by_vector(query_embedding, k=4)
    return {"internship_id": internship_id, "top_applicants": matches}

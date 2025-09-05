# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import ChatPromptTemplate
# from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.output_parsers import PydanticOutputParser
from langchain_chroma import Chroma
import uuid

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
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

# ----------- Vector Stores -----------
# Store internship embeddings
internship_db = Chroma(collection_name="internships", embedding_function=embeddings)

# Store applicant resume embeddings
applicant_db = Chroma(collection_name="applicants", embedding_function=embeddings)

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
    skills_embeddings = embeddings.embed_documents(skills)
    return {"skills": skills, "embeddings": skills_embeddings}


@app.post("/admin/internship")
def internship_embeddings(data: InternshipInput):
    """
    Admin provides internship details + skills → store embedding in DB
    """
    text_data = f"Title: {data.title}\nDescription: {data.description}\nSkills: {', '.join(data.skills)}"
    internship_embedding = embeddings.embed_query(text_data)

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
    applicant_embedding = embeddings.embed_query(text_data)

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
    # Get applicant’s embedding from DB
    results = applicant_db.get(ids=[applicant_id])
    if not results["documents"]:
        return {"error": "Applicant not found"}

    applicant_text = results["documents"][0]
    query_embedding = embeddings.embed_query(applicant_text)

    # Search internships
    matches = internship_db.similarity_search_by_vector(query_embedding, k=5)
    return {"applicant_id": applicant_id, "top_matches": matches}


@app.get("/match/internship/{internship_id}")
def match_applicants(internship_id: str):
    """
    Admin retrieves top 4 applicants for given internship
    """
    # Get internship’s embedding
    results = internship_db.get(ids=[internship_id])
    if not results["documents"]:
        return {"error": "Internship not found"}

    internship_text = results["documents"][0]
    query_embedding = embeddings.embed_query(internship_text)

    # Search applicants
    matches = applicant_db.similarity_search_by_vector(query_embedding, k=4)
    return {"internship_id": internship_id, "top_applicants": matches}

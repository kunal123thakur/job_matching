from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

import crud
import models
import schemas
from database import SessionLocal, engine, init_db

models.Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/internships/", response_model=schemas.Internship)
def create_internship(internship: schemas.InternshipCreate, db: Session = Depends(get_db)):
    return crud.create_internship(db=db, internship=internship)

@app.get("/internships/", response_model=List[schemas.Internship])
def read_internships(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    internships = crud.get_internships(db, skip=skip, limit=limit)
    return internships

@app.post("/search/")
def search_internships(candidate_skills: schemas.CandidateSkills, limit: int = 5, db: Session = Depends(get_db)):
    return crud.search_internships(db=db, candidate_skills=candidate_skills, limit=limit)

@app.post("/candidates/", response_model=schemas.Candidate)
def create_candidate(
    name: str = Form(...),
    email: str = Form(...),
    father_income: float = Form(None),
    preferred_location: str = Form(None),
    resume: UploadFile = File(...),
    income_certificate: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    resume_path = os.path.join(upload_dir, resume.filename)
    with open(resume_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    income_certificate_path = os.path.join(upload_dir, income_certificate.filename)
    with open(income_certificate_path, "wb") as buffer:
        shutil.copyfileobj(income_certificate.file, buffer)

    candidate_data = schemas.CandidateCreate(
        name=name,
        email=email,
        father_income=father_income,
        preferred_location=preferred_location
    )
    
    return crud.create_candidate(
        db=db,
        candidate=candidate_data,
        resume_path=resume_path,
        income_certificate_path=income_certificate_path
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to the Internship Matching API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



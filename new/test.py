import requests

BASE_URL = "http://127.0.0.1:8000"  # FastAPI default

# ---------- 1. Test Resume Skill Extraction ----------
def test_resume_skills():
    file_path = "SIH/sampl-Resume.pdf"   # 👈 change to your resume path
    response = requests.get(f"{BASE_URL}/resume/skills", params={"file_path": file_path})
    print("\n[1] Resume Skills Extraction:")
    print(response.json())


# ---------- 2. Test Admin Internship Upload ----------
def test_admin_internship():
    payload = {
        "internship_id": "int_001",
        "title": "Data Analyst Intern",
        "description": "Work on SQL, dashboards, and reporting.",
        "skills": ["SQL", "Excel", "Power BI"]
    }
    response = requests.post(f"{BASE_URL}/admin/internship", json=payload)
    print("\n[2] Admin Internship Upload:")
    print(response.json())


# ---------- 3. Test Applicant Resume Upload ----------
def test_applicant_resume():
    payload = {
        "applicant_id": "app_101",
        "file_path": "SIH/sampl-Resume.pdf"   # 👈 same resume
    }
    response = requests.post(f"{BASE_URL}/applicant/resume", json=payload)
    print("\n[3] Applicant Resume Upload:")
    print(response.json())


# ---------- 4. Test Applicant → Internship Match ----------
def test_match_applicant():
    applicant_id = "app_101"
    response = requests.get(f"{BASE_URL}/match/applicant/{applicant_id}")
    print("\n[4] Applicant Top 5 Internship Matches:")
    print(response.json())


# ---------- 5. Test Internship → Applicant Match ----------
def test_match_internship():
    internship_id = "int_001"
    response = requests.get(f"{BASE_URL}/match/internship/{internship_id}")
    print("\n[5] Internship Top 4 Applicant Matches:")
    print(response.json())


if __name__ == "__main__":
    test_resume_skills()
    test_admin_internship()
    test_applicant_resume()
    test_match_applicant()
    test_match_internship()

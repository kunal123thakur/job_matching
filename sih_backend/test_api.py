import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_get_internships():
    print("--- Testing GET /internships/ ---")
    response = requests.get(f"{BASE_URL}/internships/")
    if response.status_code == 200:
        print("GET /internships/ - Success")
        # print(response.json())
    else:
        print(f"GET /internships/ - Failure: {response.status_code}")
        print(response.text)

def test_create_candidate():
    print("\n--- Testing POST /candidates/ ---")
    url = f"{BASE_URL}/candidates/"
    files = {
        'resume': ('sampl-Resume.pdf', open('SIH/sampl-Resume.pdf', 'rb'), 'application/pdf'),
        'income_certificate': ('income-certificate.pdf', open('SIH/income-certificate.pdf', 'rb'), 'application/pdf')
    }
    data = {
        'name': 'John Doe',
        'email': 'john.doe@example.com'
    }
    response = requests.post(url, files=files, data=data)
    if response.status_code == 200:
        print("POST /candidates/ - Success")
        print(response.json())
    else:
        print(f"POST /candidates/ - Failure: {response.status_code}")
        print(response.text)

def test_search_internships():
    print("\n--- Testing POST /search/ ---")
    url = f"{BASE_URL}/search/?limit=10"
    payload = {
        "skills": ["java", "dsa", "python"]
    }
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        print("POST /search/ - Success")
        print(response.json())
    else:
        print(f"POST /search/ - Failure: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    # test_get_internships()
    # test_create_candidate()
    test_search_internships()

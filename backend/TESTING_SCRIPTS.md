# Quick Testing Scripts

This file contains examples for testing the API using different tools (curl, Python requests, JavaScript fetch).

## 1. Using curl (Command Line)

### Health Check
```bash
curl -X GET "http://localhost:8000/health" \
  -H "accept: application/json"
```

### Upload Resume
```bash
# First, create a sample resume PDF or use an existing one
curl -X POST "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -F "file=@/path/to/resume.pdf"
```

### Start Interview
```bash
curl -X POST "http://localhost:8000/interview/start" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Senior Backend Engineer",
    "resume_data": {
      "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
      "experience_level": "senior",
      "domains": ["Backend", "DevOps"],
      "projects": ["InterviewIQ", "MicroDB"],
      "summary": "Senior Backend Engineer with 3+ years experience"
    }
  }'
```

### Submit Answer
```bash
curl -X POST "http://localhost:8000/interview/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "answer": "The biggest scaling challenge was our PostgreSQL database becoming a bottleneck when traffic hit 100K requests/second."
  }'
```

### Get Report
```bash
curl -X GET "http://localhost:8000/interview/report/550e8400-e29b-41d4-a716-446655440000" \
  -H "accept: application/json"
```

### Get Interview History
```bash
curl -X GET "http://localhost:8000/interviews" \
  -H "accept: application/json"
```

---

## 2. Using Python requests

```python
import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

# 1. Health check
response = requests.get(f"{BASE_URL}/health")
print("Health:", response.json())

# 2. Upload resume
with open("path/to/resume.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{BASE_URL}/upload", files=files)
    upload_data = response.json()
    print("Upload:", json.dumps(upload_data, indent=2))
    resume_data = upload_data["resume_data"]

# 3. Start interview
start_data = {
    "role": "Senior Backend Engineer",
    "resume_data": resume_data
}
response = requests.post(f"{BASE_URL}/interview/start", json=start_data)
start_response = response.json()
print("Start:", json.dumps(start_response, indent=2))
session_id = start_response["session_id"]

# 4. Submit answer
chat_data = {
    "session_id": session_id,
    "answer": "The biggest scaling challenge was database bottleneck we fixed with Redis caching and read replicas."
}
response = requests.post(f"{BASE_URL}/interview/chat", json=chat_data)
chat_response = response.json()
print("Chat Response:", json.dumps(chat_response, indent=2))

# 5. Get report
response = requests.get(f"{BASE_URL}/interview/report/{session_id}")
report = response.json()
print("Report:", json.dumps(report, indent=2))

# 6. Get history
response = requests.get(f"{BASE_URL}/interviews")
history = response.json()
print("History:", json.dumps(history, indent=2))
```

**Run it**:
```bash
python test_api.py
```

---

## 3. Using JavaScript/Node.js (fetch)

```javascript
const BASE_URL = "http://localhost:8000";

async function testAPI() {
  try {
    // 1. Health check
    let response = await fetch(`${BASE_URL}/health`);
    console.log("Health:", await response.json());

    // 2. Upload resume
    const formData = new FormData();
    const fileInput = document.getElementById("resumeFile"); // or read from disk in Node.js
    formData.append("file", fileInput.files[0]);
    
    response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData
    });
    const uploadData = await response.json();
    console.log("Upload:", uploadData);
    const resumeData = uploadData.resume_data;

    // 3. Start interview
    response = await fetch(`${BASE_URL}/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "Senior Backend Engineer",
        resume_data: resumeData
      })
    });
    const startData = await response.json();
    console.log("Start:", startData);
    const sessionId = startData.session_id;

    // 4. Submit answer
    response = await fetch(`${BASE_URL}/interview/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        answer: "The biggest scaling challenge was..."
      })
    });
    const chatData = await response.json();
    console.log("Chat:", chatData);

    // 5. Get report
    response = await fetch(`${BASE_URL}/interview/report/${sessionId}`);
    const report = await response.json();
    console.log("Report:", report);

  } catch (error) {
    console.error("Error:", error);
  }
}

testAPI();
```

---

## 4. Automated Full Interview Test (Python)

This script runs a complete 5-question interview automatically:

```python
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_full_interview():
    """Run a complete 5-question interview with sample answers."""
    
    # Sample answers for each question
    sample_answers = [
        "The biggest scaling challenge was our PostgreSQL database becoming a bottleneck when traffic hit 100K requests/second. We implemented read replicas and a distributed cache layer using Redis, which reduced p99 latency from 800ms to 50ms.",
        
        "We had a MySQL deadlock that only happened under specific load conditions. We used binary search with our load testing to isolate it and discovered circular lock dependencies. Fixed it by changing the order of table locks and adding retry logic.",
        
        "I use Docker for local development which matches production exactly. I version everything in git, use GitHub Actions for CI/CD, and deploy to Kubernetes. Every deploy is immutable - if there's an issue, we rollback the Docker image version.",
        
        "Testing is critical - I write unit tests for business logic (~80% coverage), integration tests for API contracts, and performance tests for critical paths. We run these automatically on every PR with blue-green deploys.",
        
        "The biggest mistake was scaling too early with fancy distributed systems before we needed them. Now I follow: get it working, measure, then optimize. Documentation of technical decisions is also critical for team alignment.",
    ]
    
    # 1. Upload resume
    print("📤 Uploading resume...")
    with open("sample_resume.pdf", "rb") as f:
        files = {"file": f}
        response = requests.post(f"{BASE_URL}/upload", files=files)
    upload_data = response.json()
    resume_data = upload_data["resume_data"]
    print(f"✅ Resume analyzed. Skills: {', '.join(resume_data.get('skills', [])[:3])}")
    
    # 2. Start interview
    print("\n🎤 Starting interview...")
    start_response = requests.post(
        f"{BASE_URL}/interview/start",
        json={
            "role": "Senior Backend Engineer",
            "resume_data": resume_data
        }
    ).json()
    session_id = start_response["session_id"]
    print(f"✅ Session: {session_id}")
    print(f"Q1: {start_response['first_question'][:100]}...")
    
    # 3. Answer all 5 questions
    for i, answer in enumerate(sample_answers, 1):
        print(f"\n💬 Question {i} - Submitting answer...")
        time.sleep(1)  # Small delay for rate limiting
        
        response = requests.post(
            f"{BASE_URL}/interview/chat",
            json={"session_id": session_id, "answer": answer}
        ).json()
        
        score = response["evaluation"]["score"]
        print(f"✅ Score: {score}/10")
        print(f"   Feedback: {response['evaluation']['feedback'][:100]}...")
        
        if response.get("next_question"):
            print(f"   Next Q: {response['next_question'][:80]}...")
        else:
            print("✅ Interview complete!")
    
    # 4. Get final report
    print("\n📊 Getting final report...")
    report = requests.get(f"{BASE_URL}/interview/report/{session_id}").json()
    
    print(f"\n{'='*50}")
    print(f"FINAL REPORT")
    print(f"{'='*50}")
    print(f"Role: {report['role']}")
    print(f"Average Score: {report['average_score']}/10")
    print(f"Recommendation: {report['recommendation']}")
    print(f"Strengths: {', '.join(report['strengths'][:2])}")
    print(f"Areas to Improve: {', '.join(report['weaknesses'][:2])}")
    print(f"{'='*50}")

if __name__ == "__main__":
    test_full_interview()
```

**Run it**:
```bash
python test_full_interview.py
```

---

## 5. Load Testing (Simulate Multiple Interviews)

```python
import requests
import concurrent.futures
import time

BASE_URL = "http://localhost:8000"

def run_single_interview(interview_num):
    """Run one complete interview."""
    try:
        # Upload
        with open("sample_resume.pdf", "rb") as f:
            response = requests.post(f"{BASE_URL}/upload", files={"file": f})
        resume_data = response.json()["resume_data"]
        
        # Start
        response = requests.post(
            f"{BASE_URL}/interview/start",
            json={"role": "Senior Backend Engineer", "resume_data": resume_data}
        )
        session_id = response.json()["session_id"]
        
        # Chat
        response = requests.post(
            f"{BASE_URL}/interview/chat",
            json={
                "session_id": session_id,
                "answer": "I'm very experienced with scaling systems and have worked on many distributed systems projects."
            }
        )
        
        # Report
        response = requests.get(f"{BASE_URL}/interview/report/{session_id}")
        score = response.json()["average_score"]
        
        print(f"✅ Interview {interview_num} completed (score: {score})")
        return True
    except Exception as e:
        print(f"❌ Interview {interview_num} failed: {e}")
        return False

def load_test(num_interviews=5):
    """Run multiple interviews concurrently."""
    print(f"Running {num_interviews} concurrent interviews...")
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = [
            executor.submit(run_single_interview, i)
            for i in range(1, num_interviews + 1)
        ]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    elapsed = time.time() - start_time
    successful = sum(results)
    
    print(f"\n{'='*50}")
    print(f"Results: {successful}/{num_interviews} successful")
    print(f"Time: {elapsed:.2f}s")
    print(f"Avg per interview: {elapsed/num_interviews:.2f}s")
    print(f"{'='*50}")

if __name__ == "__main__":
    load_test(5)
```

---

## 6. Testing with Pytest

```python
# test_api.py
import pytest
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000"

@pytest.fixture
def sample_resume():
    """Get path to sample resume PDF."""
    return "sample_resume.pdf"

def test_health_check():
    """Test health endpoint."""
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_upload_resume(sample_resume):
    """Test resume upload and analysis."""
    with open(sample_resume, "rb") as f:
        response = requests.post(f"{BASE_URL}/upload", files={"file": f})
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "resume_data" in data
    assert "skills" in data["resume_data"]
    assert "experience_level" in data["resume_data"]

def test_interview_flow(sample_resume):
    """Test complete interview flow."""
    # Upload
    with open(sample_resume, "rb") as f:
        upload_response = requests.post(f"{BASE_URL}/upload", files={"file": f})
    resume_data = upload_response.json()["resume_data"]
    
    # Start
    start_response = requests.post(
        f"{BASE_URL}/interview/start",
        json={"role": "Backend Engineer", "resume_data": resume_data}
    )
    assert start_response.status_code == 200
    session_id = start_response.json()["session_id"]
    
    # Chat
    chat_response = requests.post(
        f"{BASE_URL}/interview/chat",
        json={"session_id": session_id, "answer": "Test answer"}
    )
    assert chat_response.status_code == 200
    assert "evaluation" in chat_response.json()

def test_report(sample_resume):
    """Test report generation."""
    # Setup interview
    with open(sample_resume, "rb") as f:
        upload_response = requests.post(f"{BASE_URL}/upload", files={"file": f})
    resume_data = upload_response.json()["resume_data"]
    
    start_response = requests.post(
        f"{BASE_URL}/interview/start",
        json={"role": "Backend Engineer", "resume_data": resume_data}
    )
    session_id = start_response.json()["session_id"]
    
    # Get report (may be incomplete)
    report_response = requests.get(f"{BASE_URL}/interview/report/{session_id}")
    if report_response.status_code == 200:
        report = report_response.json()
        assert "average_score" in report
        assert "recommendation" in report
```

**Run tests**:
```bash
pytest test_api.py -v
```

---

## Tips for Testing

- **Use the Swagger UI first**: http://localhost:8000/docs
  - Most intuitive for exploring API
  - Visual request/response builder
  - Copy-paste ready JSON
  
- **Then use curl for scripting**: Fast, no dependencies

- **Use Python for automation**: Better control, easier error handling

- **Use JavaScript for frontend testing**: Test real browser integration

- **Monitor backend logs**: `tail -f backend.log` for debugging

---

## Sample Resume for Testing

Create a `sample_resume.pdf` with content like:

```
JOHN DOE
john@example.com | linkedin.com/in/johndoe

EXPERIENCE
Senior Backend Engineer | TechCorp (2020-2023)
- Led microservices architecture handling 1M+ requests/day
- Reduced database query latency from 500ms to 50ms
- Mentored team of 5 junior engineers

Backend Engineer | StartupXYZ (2018-2020)
- Built REST APIs using FastAPI and PostgreSQL
- Implemented Redis caching layer
- Deployed to AWS using Docker and Kubernetes

SKILLS
Languages: Python, Go, TypeScript, SQL
Databases: PostgreSQL, MySQL, MongoDB, Redis
DevOps: Docker, Kubernetes, AWS, GitHub Actions
Tools: FastAPI, SQLAlchemy, Git, Linux

EDUCATION
B.Tech Computer Science | IIT Delhi (2018)

PROJECTS
InterviewIQ - AI-powered mock interview platform (FastAPI + React)
MicroDB - In-memory distributed database (Go)
```

---

Ready to test! 🚀

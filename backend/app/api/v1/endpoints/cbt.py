from fastapi import APIRouter
from app.schemas.cbt import ExamStartRequest, ExamSubmitRequest, ExamResultResponse

router = APIRouter()

@router.post("/start")
def start_cbt_session(request: ExamStartRequest):
    """Initialize a timed CBT exam session for 4 subjects"""
    return {
        "session_id": 9901,
        "mode": request.mode,
        "subject_ids": request.subject_ids,
        "total_questions": len(request.subject_ids) * 40,
        "time_allowed_minutes": 120,
        "status": "in_progress"
    }

@router.post("/submit", response_model=ExamResultResponse)
def submit_cbt_session(request: ExamSubmitRequest):
    """Submit exam answers and calculate instant score and breakdown"""
    # Mock calculation for architecture setup
    total = 180
    correct = 145
    score = (correct / total) * 400

    return {
        "session_id": request.session_id,
        "score": round(score, 1),
        "total_questions": total,
        "percentage": round((correct / total) * 100, 1),
        "correct_count": correct,
        "subject_breakdown": {
            "Use of English": 52,
            "Mathematics": 32,
            "Physics": 31,
            "Chemistry": 30
        }
    }

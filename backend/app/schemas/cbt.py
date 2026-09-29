from pydantic import BaseModel
from typing import List, Dict, Optional

class ExamStartRequest(BaseModel):
    subject_ids: List[int]
    mode: str = "cbt" # "cbt" or "practice"
    question_count_per_subject: int = 40

class ExamSubmitRequest(BaseModel):
    session_id: int
    answers: Dict[int, str] # {question_id: selected_option}
    time_spent_seconds: int

class ExamResultResponse(BaseModel):
    session_id: int
    score: float
    total_questions: int
    percentage: float
    correct_count: int
    subject_breakdown: Dict[str, int]

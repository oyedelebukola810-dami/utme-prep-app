from fastapi import APIRouter
from typing import List

router = APIRouter()

MOCK_SUBJECTS = [
    {"id": 1, "code": "ENG", "name": "Use of English", "question_count": 1420},
    {"id": 2, "code": "MTH", "name": "Mathematics", "question_count": 1150},
    {"id": 3, "code": "PHY", "name": "Physics", "question_count": 980},
    {"id": 4, "code": "CHM", "name": "Chemistry", "question_count": 940},
    {"id": 5, "code": "BIO", "name": "Biology", "question_count": 1020},
    {"id": 6, "code": "GOV", "name": "Government", "question_count": 890},
    {"id": 7, "code": "ECO", "name": "Economics", "question_count": 910},
    {"id": 8, "code": "LIT", "name": "Literature in English", "question_count": 760},
]

@router.get("/", response_model=List[dict])
def get_utme_subjects():
    """Retrieve all available UTME subjects"""
    return MOCK_SUBJECTS

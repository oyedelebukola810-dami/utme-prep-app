from fastapi import APIRouter, Query
from typing import List, Optional

router = APIRouter()

MOCK_QUESTIONS = [
    {
        "id": 101,
        "subject_id": 1,
        "year": 2023,
        "passage": "Read the passage carefully and answer the question that follows...",
        "question_text": "In line 4 of the passage, the word 'ephemeral' most nearly means:",
        "options": {
            "A": "Short-lived and temporary",
            "B": "Everlasting and eternal",
            "C": "Complicated and dense",
            "D": "Bright and shining"
        },
        "correct_option": "A",
        "explanation": "Ephemeral originates from Greek 'ephemeros' meaning lasting only a day or a very short time."
    },
    {
        "id": 102,
        "subject_id": 2,
        "year": 2022,
        "passage": None,
        "question_text": "Evaluate the integral ∫ (3x² + 4x - 5) dx.",
        "options": {
            "A": "x³ + 2x² - 5x + C",
            "B": "6x + 4 + C",
            "C": "3x³ + 4x² - 5x + C",
            "D": "x³ + 4x² - 5 + C"
        },
        "correct_option": "A",
        "explanation": "Applying power rule for integration: ∫ 3x² dx = x³, ∫ 4x dx = 2x², ∫ -5 dx = -5x. Hence x³ + 2x² - 5x + C."
    }
]

@router.get("/", response_model=List[dict])
def get_questions(
    subject_id: Optional[int] = None,
    year: Optional[int] = None,
    limit: int = 40
):
    """Retrieve questions filtered by subject and year"""
    filtered = MOCK_QUESTIONS
    if subject_id:
        filtered = [q for q in filtered if q["subject_id"] == subject_id]
    if year:
        filtered = [q for q in filtered if q["year"] == year]
    return filtered[:limit]

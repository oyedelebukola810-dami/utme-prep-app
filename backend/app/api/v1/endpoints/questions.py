from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.session import get_db
from app.models.question import Question
from app.models.subject import Subject

router = APIRouter()

SEED_QUESTIONS = [
    {
        "subject_code": "ENG",
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
        "explanation": "Ephemeral originates from Greek 'ephemeros' meaning lasting only a day or a very short time.",
        "difficulty": "Medium",
        "status": "Published"
    },
    {
        "subject_code": "MTH",
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
        "explanation": "Applying power rule for integration: ∫ 3x² dx = x³, ∫ 4x dx = 2x², ∫ -5 dx = -5x. Hence x³ + 2x² - 5x + C.",
        "difficulty": "Hard",
        "status": "Published"
    }
]

def ensure_seed_questions(db: Session):
    published_count = db.query(Question).filter(Question.status == "Published").count()
    if published_count == 0:
        subjects = {s.code: s.id for s in db.query(Subject).all()}
        for sq in SEED_QUESTIONS:
            s_id = subjects.get(sq["subject_code"])
            if s_id:
                q = Question(
                    subject_id=s_id,
                    year=sq["year"],
                    passage=sq["passage"],
                    question_text=sq["question_text"],
                    options=sq["options"],
                    correct_option=sq["correct_option"],
                    explanation=sq["explanation"],
                    difficulty=sq["difficulty"],
                    status=sq["status"]
                )
                db.add(q)
        db.commit()

@router.get("", response_model=List[Dict[str, Any]])
@router.get("/", response_model=List[Dict[str, Any]])
def get_candidate_questions(
    subject_id: Optional[int] = None,
    topic_id: Optional[int] = None,
    year: Optional[int] = None,
    limit: int = 40,
    db: Session = Depends(get_db)
):
    """
    Retrieve published candidate practice questions from persistent DB.
    DRAFT AND UNPUBLISHED QUESTIONS ARE STRICTLY EXCLUDED.
    """
    ensure_seed_questions(db)

    # Strictly filter by status == 'Published'
    query = db.query(Question).filter(Question.status == "Published")

    if subject_id:
        query = query.filter(Question.subject_id == subject_id)
    if topic_id:
        query = query.filter(Question.topic_id == topic_id)
    if year:
        query = query.filter(Question.year == year)

    questions = query.order_by(Question.id.asc()).limit(limit).all()

    return [
        {
            "id": q.id,
            "subject_id": q.subject_id,
            "topic_id": q.topic_id,
            "year": q.year,
            "passage": q.passage,
            "question_text": q.question_text,
            "options": q.options,
            "correct_option": q.correct_option,
            "explanation": q.explanation,
            "difficulty": q.difficulty,
            "status": q.status
        }
        for q in questions
    ]


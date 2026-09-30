from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_db
from app.models.subject import Subject, Topic

router = APIRouter()

DEFAULT_SUBJECTS = [
    {"code": "ENG", "name": "Use of English", "description": "Compulsory UTME subject testing comprehension, grammar, and vocabulary."},
    {"code": "MTH", "name": "Mathematics", "description": "Algebra, Trigonometry, Calculus, Statistics, and Geometry."},
    {"code": "PHY", "name": "Physics", "description": "Mechanics, Waves, Thermal Physics, Electricity, and Modern Physics."},
    {"code": "CHM", "name": "Chemistry", "description": "Physical, Organic, and Inorganic Chemistry."},
    {"code": "BIO", "name": "Biology", "description": "Living organisms, Genetics, Ecology, and Human Physiology."},
    {"code": "GOV", "name": "Government", "description": "Political concepts, Nigerian Government, and International Organizations."},
    {"code": "ECO", "name": "Economics", "description": "Microeconomics, Macroeconomics, and Money & Banking."},
    {"code": "LIT", "name": "Literature in English", "description": "Drama, Prose, Poetry, and Literary Appreciation."}
]

def ensure_subjects_seeded(db: Session):
    count = db.query(Subject).count()
    if count == 0:
        for s_data in DEFAULT_SUBJECTS:
            subj = Subject(code=s_data["code"], name=s_data["name"], description=s_data["description"])
            db.add(subj)
        db.commit()

@router.get("", response_model=List[Dict[str, Any]])
@router.get("/", response_model=List[Dict[str, Any]])
def get_utme_subjects(db: Session = Depends(get_db)):
    """Retrieve all available UTME subjects with question counts"""
    ensure_subjects_seeded(db)
    subjects = db.query(Subject).order_by(Subject.id.asc()).all()

    res = []
    for s in subjects:
        q_count = len([q for q in s.questions if q.status == "Published"])
        res.append({
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "description": s.description,
            "question_count": q_count,
            "topics": [{"id": t.id, "name": t.name} for t in s.topics]
        })
    return res

@router.get("/{subject_id}/topics", response_model=List[Dict[str, Any]])
def get_subject_topics(subject_id: int, db: Session = Depends(get_db)):
    """Retrieve topics for a specific subject"""
    ensure_subjects_seeded(db)
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).all()
    return [{"id": t.id, "name": t.name, "description": t.description} for t in topics]


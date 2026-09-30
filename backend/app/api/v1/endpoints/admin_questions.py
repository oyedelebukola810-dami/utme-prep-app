from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.db.session import get_db
from app.models.question import Question
from app.models.subject import Subject, Topic
from app.models.user import User
from app.api.deps import get_current_admin_user
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionListResponse,
    AdminQuestionStats
)

router = APIRouter()

@router.get("/stats", response_model=AdminQuestionStats)
def get_admin_question_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Retrieve high-level question bank metrics for admin dashboard"""
    total = db.query(func.count(Question.id)).scalar() or 0
    published = db.query(func.count(Question.id)).filter(Question.status == "Published").scalar() or 0
    drafts = db.query(func.count(Question.id)).filter(Question.status == "Draft").scalar() or 0
    total_subjects = db.query(func.count(Subject.id)).scalar() or 0

    # Fetch recent activity
    recent_qs = (
        db.query(Question)
        .order_by(Question.updated_at.desc(), Question.id.desc())
        .limit(5)
        .all()
    )

    recent_activity = [
        {
            "id": str(q.id),
            "text": q.question_text[:60] + ("..." if len(q.question_text) > 60 else ""),
            "status": q.status,
            "subject_code": q.subject.code if q.subject else "GEN",
            "time": q.updated_at.strftime("%Y-%m-%d %H:%M") if q.updated_at else "Recently"
        }
        for q in recent_qs
    ]

    return {
        "total_questions": total,
        "published_questions": published,
        "draft_questions": drafts,
        "total_subjects": total_subjects,
        "recent_activity": recent_activity
    }

@router.get("", response_model=QuestionListResponse)
@router.get("/", response_model=QuestionListResponse)
def list_questions_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    subject_id: Optional[int] = None,
    topic_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Filter, search, and paginate question bank records (Admin Only)"""
    query = db.query(Question)

    if subject_id:
        query = query.filter(Question.subject_id == subject_id)
    if topic_id:
        query = query.filter(Question.topic_id == topic_id)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty.capitalize().strip())
    if status:
        query = query.filter(Question.status == status.capitalize().strip())
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(Question.question_text.ilike(search_term))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    questions = (
        query.order_by(Question.id.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "questions": questions
    }

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question_by_id(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Get single question detail by ID (Admin Only)"""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question #{question_id} not found."
        )
    return q

@router.post("", response_model=QuestionResponse, status_code=201)
@router.post("/", response_model=QuestionResponse, status_code=201)
def create_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Create a new question entry in persistent database with duplicate checking (Admin Only)"""
    # 1. Validate subject existence
    subj = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid subject_id {payload.subject_id}. Subject does not exist."
        )

    # 2. Prevent accidental duplicate submissions
    clean_text = payload.question_text.strip()
    existing_dup = (
        db.query(Question)
        .filter(
            Question.subject_id == payload.subject_id,
            func.lower(Question.question_text) == clean_text.lower()
        )
        .first()
    )

    if existing_dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A duplicate question with identical text already exists in {subj.name} (Question #{existing_dup.id})."
        )

    new_q = Question(
        subject_id=payload.subject_id,
        topic_id=payload.topic_id,
        subtopic=payload.subtopic.strip() if payload.subtopic else None,
        year=payload.year,
        source=payload.source.strip() if payload.source else None,
        passage=payload.passage,
        question_text=clean_text,
        image_url=payload.image_url,
        options=payload.options,
        correct_option=payload.correct_option.upper().strip(),
        explanation=payload.explanation.strip() if payload.explanation else None,
        difficulty=payload.difficulty.capitalize().strip(),
        status=payload.status.capitalize().strip()
    )

    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Update existing question entry (Admin Only)"""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question #{question_id} not found."
        )

    if payload.subject_id is not None:
        subj = db.query(Subject).filter(Subject.id == payload.subject_id).first()
        if not subj:
            raise HTTPException(status_code=400, detail="Invalid subject_id.")
        q.subject_id = payload.subject_id

    if payload.topic_id is not None:
        q.topic_id = payload.topic_id
    if payload.subtopic is not None:
        q.subtopic = payload.subtopic.strip()
    if payload.year is not None:
        q.year = payload.year
    if payload.source is not None:
        q.source = payload.source.strip()
    if payload.passage is not None:
        q.passage = payload.passage
    if payload.question_text is not None:
        q.question_text = payload.question_text.strip()
    if payload.image_url is not None:
        q.image_url = payload.image_url
    if payload.options is not None:
        q.options = payload.options
    if payload.correct_option is not None:
        q.correct_option = payload.correct_option.upper().strip()
    if payload.explanation is not None:
        q.explanation = payload.explanation.strip()
    if payload.difficulty is not None:
        q.difficulty = payload.difficulty.capitalize().strip()
    if payload.status is not None:
        q.status = payload.status.capitalize().strip()

    db.commit()
    db.refresh(q)
    return q

@router.patch("/{question_id}/status", response_model=QuestionResponse)
def toggle_question_status(
    question_id: int,
    status_value: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Publish or unpublish a question (Admin Only)"""
    clean_status = status_value.capitalize().strip()
    if clean_status not in ["Draft", "Published"]:
        raise HTTPException(status_code=400, detail="Status must be 'Draft' or 'Published'.")

    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found.")

    q.status = clean_status
    db.commit()
    db.refresh(q)
    return q

@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Delete a question from database (Admin Only)"""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question #{question_id} not found."
        )

    db.delete(q)
    db.commit()
    return {"message": f"Question #{question_id} successfully deleted.", "id": question_id}

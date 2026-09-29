from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    mode = Column(String(20), default="cbt") # "cbt" or "practice"
    subject_ids = Column(JSON, nullable=False) # Array of subject IDs chosen
    total_questions = Column(Integer, default=180)
    score = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=0)
    answers = Column(JSON, nullable=True) # User selections & status per question
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

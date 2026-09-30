from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    subtopic = Column(String(150), nullable=True)
    year = Column(Integer, nullable=True) # Past question year e.g. 2023
    source = Column(String(255), nullable=True) # Source/reference
    passage = Column(Text, nullable=True) # Comprehension passage if English/Literature
    question_text = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True) # Optional diagram/formula image
    options = Column(JSON, nullable=False) # e.g. {"A": "Option 1", "B": "Option 2", ...}
    correct_option = Column(String(5), nullable=False) # e.g. "A"
    explanation = Column(Text, nullable=True) # Detailed step-by-step solution
    difficulty = Column(String(20), default="Medium") # Easy, Medium, Hard
    status = Column(String(20), default="Draft") # Draft or Published
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    subject = relationship("Subject", back_populates="questions")
    topic = relationship("Topic", back_populates="questions")


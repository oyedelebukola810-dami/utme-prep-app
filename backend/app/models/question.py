from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from app.db.base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    year = Column(Integer, nullable=True) # Past question year e.g. 2023
    passage = Column(Text, nullable=True) # Comprehension passage if English/Literature
    question_text = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True) # Optional diagram/formula image
    options = Column(JSON, nullable=False) # e.g. {"A": "Option 1", "B": "Option 2", ...}
    correct_option = Column(String(5), nullable=False) # e.g. "A"
    explanation = Column(Text, nullable=True) # Detailed step-by-step solution

from pydantic import BaseModel
from typing import Dict, Optional

class QuestionBase(BaseModel):
    subject_id: int
    topic_id: Optional[int] = None
    year: Optional[int] = None
    passage: Optional[str] = None
    question_text: str
    image_url: Optional[str] = None
    options: Dict[str, str] # e.g. {"A": "Option text", "B": "Option text"}

class QuestionCreate(QuestionBase):
    correct_option: str
    explanation: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class QuestionExamView(QuestionBase):
    id: int
    # Exclude correct_option during active exam!

    class Config:
        from_attributes = True

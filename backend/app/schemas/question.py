from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional
from datetime import datetime

class QuestionBase(BaseModel):
    subject_id: int
    topic_id: Optional[int] = None
    subtopic: Optional[str] = None
    year: Optional[int] = None
    source: Optional[str] = None
    passage: Optional[str] = None
    question_text: str = Field(..., min_length=5)
    image_url: Optional[str] = None
    options: Dict[str, str] # e.g. {"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"}
    correct_option: str # "A", "B", "C", "D"
    explanation: Optional[str] = None
    difficulty: str = "Medium" # Easy, Medium, Hard
    status: str = "Draft" # Draft or Published

    @validator('correct_option')
    def validate_correct_option(cls, v):
        v_upper = v.upper().strip()
        if v_upper not in ["A", "B", "C", "D"]:
            raise ValueError("correct_option must be one of: A, B, C, D")
        return v_upper

    @validator('difficulty')
    def validate_difficulty(cls, v):
        v_cap = v.capitalize().strip()
        if v_cap not in ["Easy", "Medium", "Hard"]:
            raise ValueError("difficulty must be one of: Easy, Medium, Hard")
        return v_cap

    @validator('status')
    def validate_status(cls, v):
        v_cap = v.capitalize().strip()
        if v_cap not in ["Draft", "Published"]:
            raise ValueError("status must be one of: Draft, Published")
        return v_cap

    @validator('options')
    def validate_options(cls, v):
        keys = set(k.upper().strip() for k in v.keys())
        if not {"A", "B", "C", "D"}.issubset(keys):
            raise ValueError("options dict must contain all four choices: A, B, C, and D")
        for k, val in v.items():
            if not str(val).strip():
                raise ValueError(f"Option {k} text cannot be empty.")
        return v

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    subtopic: Optional[str] = None
    year: Optional[int] = None
    source: Optional[str] = None
    passage: Optional[str] = None
    question_text: Optional[str] = None
    image_url: Optional[str] = None
    options: Optional[Dict[str, str]] = None
    correct_option: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None

class SubjectSimpleResponse(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True

class QuestionResponse(QuestionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    subject: Optional[SubjectSimpleResponse] = None

    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    questions: List[QuestionResponse]

class AdminQuestionStats(BaseModel):
    total_questions: int
    published_questions: int
    draft_questions: int
    total_subjects: int
    recent_activity: List[Dict[str, str]]


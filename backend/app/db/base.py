from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Register models with Base.metadata
from app.models.user import User
from app.models.subject import Subject, Topic
from app.models.question import Question
from app.models.exam_session import ExamSession


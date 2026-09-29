from fastapi import APIRouter
from app.api.v1.endpoints import auth, subjects, questions, cbt

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["UTME Subjects"])
api_router.include_router(questions.router, prefix="/questions", tags=["Question Bank"])
api_router.include_router(cbt.router, prefix="/cbt", tags=["CBT Exam Engine"])

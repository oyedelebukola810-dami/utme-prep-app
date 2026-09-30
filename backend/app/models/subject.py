from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False) # e.g. ENG, MTH, PHY
    name = Column(String(100), nullable=False) # e.g. Use of English
    description = Column(Text, nullable=True)

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic")


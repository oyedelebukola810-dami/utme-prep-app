import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger("db_session")

# Database connection builder with SQLite fallback for offline local dev/testing
database_url = settings.DATABASE_URL
connect_args = {}

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(database_url, pool_pre_ping=True, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.warning(f"[DATABASE] Primary DB connection ({database_url}) failed: {str(e)}. Falling back to local sqlite database.")
    fallback_url = "sqlite:///./utme_local.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Ensures all ORM tables are created in the persistent database"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("[DATABASE] Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"[DATABASE ERROR] Table initialization failed: {str(e)}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

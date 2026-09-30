import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger("db_session")

def create_db_engine():
    db_url = settings.EFFECTIVE_DATABASE_URL
    is_production = settings.APP_ENV == "production" or not settings.DEBUG
    
    # Strict Production Check: Refuse to run production with SQLite or missing DB URL
    if is_production and (not db_url or "sqlite" in db_url.lower()):
        raise RuntimeError(
            "PRODUCTION FATAL ERROR: A valid persistent PostgreSQL DATABASE_URL is required in production. "
            "Local SQLite fallback is disabled when APP_ENV=production or DEBUG=False."
        )

    connect_args = {}
    pool_kwargs = {}

    if "sqlite" in db_url.lower():
        connect_args = {"check_same_thread": False}
    else:
        # PostgreSQL Serverless Connection Pool configuration
        if settings.APP_ENV == "serverless":
            pool_kwargs["poolclass"] = NullPool
        else:
            pool_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
            pool_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW
            pool_kwargs["pool_pre_ping"] = True

    try:
        engine = create_engine(db_url, connect_args=connect_args, **pool_kwargs)
        logger.info(f"[DATABASE] Connected to database engine ({'PostgreSQL' if 'postgresql' in db_url else 'SQLite'}).")
        return engine
    except Exception as e:
        if is_production:
            raise RuntimeError(f"PRODUCTION FATAL: PostgreSQL Connection Failed: {str(e)}")
        
        logger.warning(f"[DATABASE] Connection to '{db_url}' failed: {str(e)}. Falling back to local SQLite database.")
        fallback_url = "sqlite:///./utme_local.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Ensures all ORM tables are initialized in the persistent database"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("[DATABASE] Database ORM schemas initialized successfully.")
    except Exception as e:
        logger.error(f"[DATABASE ERROR] Schema initialization failed: {str(e)}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

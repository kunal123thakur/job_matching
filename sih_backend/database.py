import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('DATABASE_URL')

if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(
    url,
    connect_args={"sslmode": "require"}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    with engine.connect() as conn:
        print(conn.execute(text("SELECT 1")).scalar())
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
        print("✅ pgvector extension enabled!")
    Base.metadata.create_all(bind=engine)

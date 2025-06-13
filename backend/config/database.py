from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import create_engine
from dotenv import load_dotenv
import os 

load_dotenv()
Base = declarative_base()

USERNAME_DB = os.getenv('USERNAME_DB')
PASSWORD_DB = os.getenv('PASSWORD_DB')
HOST_DB = os.getenv('HOST_DB')
NAME_DB = os.getenv('NAME_DB')

engine = create_engine(f'mysql+pymysql://{USERNAME_DB}:{PASSWORD_DB}@{HOST_DB}/{NAME_DB}')

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



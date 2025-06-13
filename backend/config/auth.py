from dotenv import load_dotenv
from datetime import timedelta
from fastapi.security.oauth2 import OAuth2PasswordBearer
import os
load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
EXPIRATION_TIME = timedelta(hours=2)
UPDATE_EXPIRATION_TIME = timedelta(days=60)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
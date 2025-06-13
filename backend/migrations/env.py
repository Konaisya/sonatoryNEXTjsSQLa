from logging.config import fileConfig
from sqlalchemy import create_engine
from sqlalchemy import pool
from alembic import context
import os
from dotenv import load_dotenv
from config.database import Base
from models import *

load_dotenv()

# Загружаем переменные из .env
USERNAME_DB = os.getenv("USERNAME_DB")
PASSWORD_DB = os.getenv("PASSWORD_DB")
HOST_DB = os.getenv("HOST_DB")
NAME_DB = os.getenv("NAME_DB")

# Формируем URL для подключения
DATABASE_URL = f"mysql+pymysql://{USERNAME_DB}:{PASSWORD_DB}@{HOST_DB}/{NAME_DB}"

# Настраиваем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Настройки Alembic
config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata  # Подключаем метаданные всех моделей

def run_migrations_offline():
    """Запускаем миграции в оффлайн-режиме."""
    context.configure(url=DATABASE_URL, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Запускаем миграции в онлайн-режиме."""
    connectable = engine.connect()
    with connectable as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
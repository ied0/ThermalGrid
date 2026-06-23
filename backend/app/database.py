"""
Veritabani baglantisini burada kuruyoruz.
SQLAlchemy'nin standart kurulumu - cok karisik bir sey yok:
  - engine: Postgres'e acilan tek baglanti noktasi
  - SessionLocal: her istek icin acip kapatacagimiz oturum
  - Base: modellerin (tablolarin) miras alacagi ana sinif
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# .env dosyasini okuyoruz (DATABASE_URL burada)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Postgres'e baglanan engine
engine = create_engine(DATABASE_URL)

# Her API isteginde bir oturum (session) acacagiz
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tum modeller bu Base'i miras alacak
Base = declarative_base()


# FastAPI'nin Depends() ile kullanacagi yardimci fonksiyon.
# Istek gelince oturum acar, is bitince kapatir. Klasik kalip.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

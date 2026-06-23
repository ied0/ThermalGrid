"""
Guvenlikle ilgili yardimci fonksiyonlar burada toplandi:
  - sifre hash'leme / dogrulama (bcrypt)
  - JWT token uretme
  - "su an giris yapmis kullanici kim?" -> get_current_user
  - rol kontrolu -> rol_gerekli("admin") gibi

Boylece router'larda Depends() ile bunlari kolayca kullanabiliyoruz.
"""

import os
import datetime

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

SECRET_KEY = os.getenv("SECRET_KEY", "degistir-beni")
ALGORITHM = "HS256"
TOKEN_SURE_DK = 60 * 24   # token 1 gun gecerli

# Bu, FastAPI'ye "token'i Authorization header'indan al" diyor.
# tokenUrl -> Swagger'daki giris formunun gidecegi adres.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---- Sifre islemleri ----
def sifre_hashle(sifre: str) -> str:
    # bcrypt salt uretip hash'liyor, sonucu string olarak donuyoruz
    return bcrypt.hashpw(sifre.encode(), bcrypt.gensalt()).decode()


def sifre_dogrula(sifre: str, hash_degeri: str) -> bool:
    return bcrypt.checkpw(sifre.encode(), hash_degeri.encode())


# ---- Token islemleri ----
def token_olustur(user: User) -> str:
    payload = {
        "sub": str(user.id),     # token kimin? -> kullanici id'si
        "rol": user.rol,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=TOKEN_SURE_DK),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ---- Giris yapmis kullaniciyi bulan dependency ----
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    hata = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Gecersiz veya suresi dolmus token",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except Exception:
        raise hata

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise hata
    return user


# ---- Rol kontrolu ----
# Kullanim: Depends(rol_gerekli("satici", "admin"))
# Yani sadece belirtilen rollerdeki kullanicilar gecebilir.
def rol_gerekli(*izinli_roller):
    def kontrol(user: User = Depends(get_current_user)) -> User:
        if user.rol not in izinli_roller:
            raise HTTPException(status_code=403, detail="Bu islem icin yetkin yok")
        return user
    return kontrol

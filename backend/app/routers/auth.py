"""
Hesap (kimlik dogrulama) endpoint'leri:
  POST /auth/register -> yeni hesap olustur (musteri veya satici)
  POST /auth/login    -> giris yap, token al
  GET  /auth/me       -> token ile "ben kimim" bilgisini don
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut, Token, ProfilUpdate, SifreUpdate
from app.security import sifre_hashle, sifre_dogrula, token_olustur, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut)
def kayit_ol(veri: UserCreate, db: Session = Depends(get_db)):
    # Ayni email zaten var mi?
    if db.query(User).filter(User.email == veri.email).first():
        raise HTTPException(status_code=400, detail="Bu email zaten kayitli")

    # Guvenlik: kayit olurken sadece musteri veya satici olunabilir.
    # Admin'i kimse kendi kendine secemesin, onu elle veriyoruz.
    rol = veri.rol if veri.rol in ("musteri", "satici") else "musteri"

    yeni_user = User(
        ad=veri.ad,
        email=veri.email,
        sifre_hash=sifre_hashle(veri.sifre),   # sifreyi hash'leyip oyle kaydediyoruz
        rol=rol,
    )
    db.add(yeni_user)
    db.commit()
    db.refresh(yeni_user)
    return yeni_user


@router.post("/login", response_model=Token)
def giris_yap(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 formunda alan adi "username" ama biz oraya email giriyoruz.
    user = db.query(User).filter(User.email == form.username).first()

    # Kullanici yoksa ya da sifre yanlissa ayni hatayi don (hangisi yanlis belli olmasin)
    if not user or not sifre_dogrula(form.password, user.sifre_hash):
        raise HTTPException(status_code=401, detail="Email veya sifre hatali")

    token = token_olustur(user)
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def ben_kimim(user: User = Depends(get_current_user)):
    # get_current_user token'i cozup kullaniciyi getiriyor, biz sadece donuyoruz
    return user


@router.put("/profil", response_model=UserOut)
def profil_guncelle(
    veri: ProfilUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Email degistiyse, baskasinin uzerinde mi diye bak
    if veri.email != user.email and db.query(User).filter(User.email == veri.email).first():
        raise HTTPException(status_code=400, detail="Bu email zaten kullaniliyor")

    user.ad = veri.ad
    user.email = veri.email
    user.adres = veri.adres
    db.commit()
    db.refresh(user)
    return user


@router.put("/sifre")
def sifre_degistir(
    veri: SifreUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Once mevcut sifre dogru mu kontrol
    if not sifre_dogrula(veri.eski_sifre, user.sifre_hash):
        raise HTTPException(status_code=400, detail="Mevcut sifre yanlis")

    user.sifre_hash = sifre_hashle(veri.yeni_sifre)
    db.commit()
    return {"ok": True}

"""
Urun endpoint'leri.

  GET  /urunler            -> butun urunleri listele
  GET  /urunler/benim      -> giris yapmis saticinin kendi urunleri
  POST /urunler            -> yeni urun ekle (sadece satici/admin)
  POST /urunler/upload-foto -> urun fotografi yukle (sadece satici/admin)
"""

import os
import uuid
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Urun, Cihaz, User, Yorum
from app.schemas import UrunOut, UrunCreate, YorumOut, YorumCreate
from app.security import rol_gerekli, get_current_user

router = APIRouter(prefix="/urunler", tags=["Urunler"])

# Yuklenen fotograflarin kaydedilecegi klasor
UPLOAD_DIR = os.path.join("static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)   # klasor yoksa olustur

IZINLI_UZANTILAR = [".jpg", ".jpeg", ".png", ".webp"]


@router.get("/", response_model=list[UrunOut])
def urunleri_listele(db: Session = Depends(get_db)):
    return db.query(Urun).all()


# DIKKAT: bu "/benim" yolu, asagidaki "/{...}" gibi dinamik bir yoldan
# ONCE tanimli olmali ki cakismasin. (Bizde dinamik yol yok ama yine de ustte.)
@router.get("/benim", response_model=list[UrunOut])
def benim_urunlerim(
    db: Session = Depends(get_db),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    # Sadece bu saticinin ekledigi urunleri don
    return db.query(Urun).filter(Urun.satici_id == user.id).all()


@router.post("/upload-foto")
def foto_yukle(
    dosya: UploadFile = File(...),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    # Uzanti kontrolu - sadece resim kabul ediyoruz
    uzanti = os.path.splitext(dosya.filename)[1].lower()
    if uzanti not in IZINLI_UZANTILAR:
        raise HTTPException(status_code=400, detail="Sadece resim dosyasi yukleyebilirsin (jpg, png, webp)")

    # Ayni isimli dosyalar birbirini ezmesin diye benzersiz isim uretiyoruz
    yeni_ad = f"{uuid.uuid4().hex}{uzanti}"
    kayit_yolu = os.path.join(UPLOAD_DIR, yeni_ad)

    # Dosyayi diske yaz
    with open(kayit_yolu, "wb") as f:
        shutil.copyfileobj(dosya.file, f)

    # Frontend'in gosterecegi URL'i don (StaticFiles /static altinda servis ediyor)
    return {"foto_url": f"/static/uploads/{yeni_ad}"}


@router.post("/", response_model=UrunOut)
def urun_ekle(
    veri: UrunCreate,
    db: Session = Depends(get_db),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    # Once urunu olustur, sahibi olarak giris yapan saticiyi yaz
    urun = Urun(
        ad=veri.ad,
        kategori=veri.kategori,
        fiyat=veri.fiyat,
        aciklama=veri.aciklama,
        foto_url=veri.foto_url,
        satici_id=user.id,
    )
    db.add(urun)
    db.commit()
    db.refresh(urun)

    # Secilen laptoplara bagla (coka-cok iliski). cihaz.urunler otomatik dolacak.
    if veri.cihaz_idler:
        cihazlar = db.query(Cihaz).filter(Cihaz.id.in_(veri.cihaz_idler)).all()
        urun.cihazlar = cihazlar
        db.commit()

    return urun


# Yardimci: urunun sahibi mi yoksa admin mi? Degilse 403.
def _sahiplik_kontrol(urun, user):
    if user.rol != "admin" and urun.satici_id != user.id:
        raise HTTPException(status_code=403, detail="Bu urun senin degil")


# ---- Urun guncelle (sahibi veya admin) ----
@router.put("/{urun_id}", response_model=UrunOut)
def urun_guncelle(
    urun_id: int,
    veri: UrunCreate,
    db: Session = Depends(get_db),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    urun = db.query(Urun).filter(Urun.id == urun_id).first()
    if urun is None:
        raise HTTPException(status_code=404, detail="Urun bulunamadi")
    _sahiplik_kontrol(urun, user)

    urun.ad = veri.ad
    urun.kategori = veri.kategori
    urun.fiyat = veri.fiyat
    urun.aciklama = veri.aciklama
    if veri.foto_url:                    # yeni foto geldiyse degistir, gelmediyse eskisi kalsin
        urun.foto_url = veri.foto_url

    # Uygun laptoplari yeniden ayarla
    cihazlar = db.query(Cihaz).filter(Cihaz.id.in_(veri.cihaz_idler)).all()
    urun.cihazlar = cihazlar

    db.commit()
    db.refresh(urun)
    return urun


# ---- Urun sil (sahibi veya admin) ----
@router.delete("/{urun_id}")
def urun_sil(
    urun_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    urun = db.query(Urun).filter(Urun.id == urun_id).first()
    if urun is None:
        raise HTTPException(status_code=404, detail="Urun bulunamadi")
    _sahiplik_kontrol(urun, user)

    db.delete(urun)
    db.commit()
    return {"ok": True}


# ---- Tek urun ----
@router.get("/{urun_id}", response_model=UrunOut)
def urun_detay(urun_id: int, db: Session = Depends(get_db)):
    urun = db.query(Urun).filter(Urun.id == urun_id).first()
    if urun is None:
        raise HTTPException(status_code=404, detail="Urun bulunamadi")
    return urun


# ---- Yorumlar ----
@router.get("/{urun_id}/yorumlar", response_model=list[YorumOut])
def yorumlari_getir(urun_id: int, db: Session = Depends(get_db)):
    # En yeni yorum ustte olsun diye tarihe gore tersten siraliyoruz
    return db.query(Yorum).filter(Yorum.urun_id == urun_id).order_by(Yorum.id.desc()).all()


@router.post("/{urun_id}/yorumlar", response_model=YorumOut)
def yorum_ekle(
    urun_id: int,
    veri: YorumCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),   # yorum yapmak icin giris sart
):
    # Puan 1-5 disinda olmasin
    if veri.puan < 1 or veri.puan > 5:
        raise HTTPException(status_code=400, detail="Puan 1 ile 5 arasinda olmali")

    yorum = Yorum(urun_id=urun_id, user_id=user.id, puan=veri.puan, metin=veri.metin)
    db.add(yorum)
    db.commit()
    db.refresh(yorum)
    return yorum

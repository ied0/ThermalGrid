"""
Siparis endpoint'leri (odeme yok, sadece kayit).
  POST  /siparisler            -> sepetten siparis olustur (giris sart)
  GET   /siparisler/benim      -> musterinin kendi siparisleri
  GET   /siparisler/satici     -> saticinin urununu iceren siparisler
  PATCH /siparisler/{id}/durum -> siparis durumunu guncelle (satici/admin)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Siparis, SiparisKalem, Urun, User
from app.schemas import SiparisCreate, SiparisOut, DurumUpdate
from app.security import get_current_user, rol_gerekli

router = APIRouter(prefix="/siparisler", tags=["Siparisler"])

# Gecerli durumlar
DURUMLAR = ["hazirlaniyor", "kargoda", "teslim"]


@router.post("/", response_model=SiparisOut)
def siparis_olustur(
    veri: SiparisCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not veri.kalemler:
        raise HTTPException(status_code=400, detail="Sepet bos")

    siparis = Siparis(user_id=user.id, durum="hazirlaniyor", toplam=0)
    db.add(siparis)
    db.flush()   # id'yi almak icin (commit etmeden)

    toplam = 0
    for k in veri.kalemler:
        urun = db.query(Urun).filter(Urun.id == k.urun_id).first()
        if urun is None:
            continue  # silinmis urun olabilir, atla
        fiyat = float(urun.fiyat or 0)
        # Urun adini ve fiyatini o anki haliyle kaydediyoruz (snapshot)
        kalem = SiparisKalem(siparis_id=siparis.id, urun_id=urun.id, ad=urun.ad, fiyat=fiyat, adet=k.adet)
        db.add(kalem)
        toplam += fiyat * k.adet

    siparis.toplam = toplam
    db.commit()
    db.refresh(siparis)
    return siparis


@router.get("/benim", response_model=list[SiparisOut])
def benim_siparislerim(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Siparis).filter(Siparis.user_id == user.id).order_by(Siparis.id.desc()).all()


@router.get("/satici", response_model=list[SiparisOut])
def satici_siparisleri(
    db: Session = Depends(get_db),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    # Bu saticinin urununu iceren siparisleri buluyoruz:
    # siparis_kalem -> urunler JOIN, urun.satici_id == bu satici
    siparisler = (
        db.query(Siparis)
        .join(SiparisKalem, SiparisKalem.siparis_id == Siparis.id)
        .join(Urun, Urun.id == SiparisKalem.urun_id)
        .filter(Urun.satici_id == user.id)
        .order_by(Siparis.id.desc())
        .distinct()
        .all()
    )
    return siparisler


@router.patch("/{siparis_id}/durum", response_model=SiparisOut)
def durum_guncelle(
    siparis_id: int,
    veri: DurumUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(rol_gerekli("satici", "admin")),
):
    if veri.durum not in DURUMLAR:
        raise HTTPException(status_code=400, detail="Gecersiz durum")

    siparis = db.query(Siparis).filter(Siparis.id == siparis_id).first()
    if siparis is None:
        raise HTTPException(status_code=404, detail="Siparis bulunamadi")

    siparis.durum = veri.durum
    db.commit()
    db.refresh(siparis)
    return siparis

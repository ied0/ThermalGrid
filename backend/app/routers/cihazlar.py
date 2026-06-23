"""
Laptop (cihaz) endpoint'leri.

Iki tane endpoint var:
  GET /cihazlar      -> butun laptoplari listele
  GET /cihazlar/{id} -> tek laptop + ona uygun urunler (COKA-COK burada!)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cihaz, User
from app.schemas import CihazOut, CihazDetayOut, CihazCreate
from app.security import rol_gerekli

# prefix sayesinde butun yollar /cihazlar ile basliyor
router = APIRouter(prefix="/cihazlar", tags=["Cihazlar"])


@router.get("/", response_model=list[CihazOut])
def cihazlari_listele(db: Session = Depends(get_db)):
    # Butun laptoplari cek, listeyi don. Cok basit.
    return db.query(Cihaz).all()


@router.get("/{cihaz_id}", response_model=CihazDetayOut)
def cihaz_detay(cihaz_id: int, db: Session = Depends(get_db)):
    # id'ye gore tek laptop bul
    cihaz = db.query(Cihaz).filter(Cihaz.id == cihaz_id).first()

    # Yoksa 404 don (id'yi yanlis girmis olabilir)
    if cihaz is None:
        raise HTTPException(status_code=404, detail="Boyle bir laptop bulunamadi")

    # Onemli: cihaz.urunler dediğimizde SQLAlchemy ara tabloyu
    # otomatik JOIN'leyip uygun urunleri getiriyor. Elle SQL yok.
    # CihazDetayOut semasi sayesinde urunler de JSON'a dahil oluyor.
    return cihaz


# ---- Admin: laptop ekle / sil ----
@router.post("/", response_model=CihazOut)
def cihaz_ekle(
    veri: CihazCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(rol_gerekli("admin")),
):
    cihaz = Cihaz(**veri.model_dump())
    db.add(cihaz)
    db.commit()
    db.refresh(cihaz)
    return cihaz


@router.delete("/{cihaz_id}")
def cihaz_sil(
    cihaz_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(rol_gerekli("admin")),
):
    cihaz = db.query(Cihaz).filter(Cihaz.id == cihaz_id).first()
    if cihaz is None:
        raise HTTPException(status_code=404, detail="Laptop bulunamadi")
    db.delete(cihaz)
    db.commit()
    return {"ok": True}

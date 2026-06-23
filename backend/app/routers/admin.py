"""
Admin paneli endpoint'leri (hepsi sadece admin).
  GET    /admin/users        -> tum kullanicilari listele
  DELETE /admin/users/{id}   -> kullanici sil
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserOut
from app.security import rol_gerekli

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserOut])
def kullanicilari_listele(
    db: Session = Depends(get_db),
    admin: User = Depends(rol_gerekli("admin")),
):
    return db.query(User).all()


@router.delete("/users/{user_id}")
def kullanici_sil(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(rol_gerekli("admin")),
):
    # Admin kendini silmesin
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Kendini silemezsin")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")

    # Kullanicinin urunu/yorumu varsa silinemez (foreign key). Kibarca soyle.
    try:
        db.delete(user)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Bu kullanicinin urunu/yorumu var, once onlari sil")

    return {"ok": True}

"""
Pydantic semalari = API'nin disariya donecegi JSON'un sekli.

Neden ayri yaziyoruz?
SQLAlchemy modelleri (models.py) veritabani icin. Ama API'den disariya
veri donerken bazen farkli sekilde gostermek isteriz (mesela bazi alanlari
gizlemek, ya da iliskili veriyi ic ice koymak). Onun icin ayri "sema" siniflari.

orm_mode / from_attributes: SQLAlchemy nesnesini direkt Pydantic'e
cevirebilmemizi sagliyor (elle dict'e cevirmekle ugrasmiyoruz).
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---------------------------------------------------------------------
# URUN semasi
# ---------------------------------------------------------------------
class UrunOut(BaseModel):
    id: int
    ad: str
    kategori: Optional[str] = None
    fiyat: Optional[float] = None
    aciklama: Optional[str] = None
    foto_url: Optional[str] = None
    cihaz_idler: list[int] = []

    class Config:
        from_attributes = True


# Satici yeni urun eklerken gonderecegi veri
class UrunCreate(BaseModel):
    ad: str
    kategori: str
    fiyat: float
    aciklama: str
    foto_url: Optional[str] = None
    cihaz_idler: list[int] = []   # bu urun hangi laptoplara uygun (coka-cok)   # SQLAlchemy nesnesinden otomatik okusun


# ---------------------------------------------------------------------
# CIHAZ semalari
# ---------------------------------------------------------------------

# Laptop listesi icin sade hali (urunler olmadan)
class CihazOut(BaseModel):
    id: int
    marka: str
    model: str
    islemci: Optional[str] = None
    isi_sorunu: Optional[str] = None

    class Config:
        from_attributes = True


# Admin yeni laptop eklerken gonderecegi veri
class CihazCreate(BaseModel):
    marka: str
    model: str
    islemci: Optional[str] = None
    isi_sorunu: Optional[str] = None


# Laptop DETAY sayfasi icin: ustteki bilgilere ek olarak
# o laptopa uygun urunlerin listesini de iceriyor.
# Iste coka-cok iliski JSON'da burada gorunecek.
class CihazDetayOut(CihazOut):
    urunler: list[UrunOut] = []


# ---------------------------------------------------------------------
# KULLANICI semalari
# ---------------------------------------------------------------------

# Kayit olurken gelen veri
class UserCreate(BaseModel):
    ad: str
    email: EmailStr
    sifre: str
    rol: Optional[str] = "musteri"   # musteri veya satici secilebilir (admin secilemez)


# Disariya kullanici donerken (sifre ASLA donmez!)
class UserOut(BaseModel):
    id: int
    ad: str
    email: EmailStr
    rol: str
    adres: Optional[str] = None

    class Config:
        from_attributes = True


# Profil bilgisi guncelleme (ad, email, adres)
class ProfilUpdate(BaseModel):
    ad: str
    email: EmailStr
    adres: Optional[str] = None


# Sifre degistirme
class SifreUpdate(BaseModel):
    eski_sifre: str
    yeni_sifre: str


# Giris basarili olunca donen token + kullanici bilgisi
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------
# YORUM semalari
# ---------------------------------------------------------------------
class YorumCreate(BaseModel):
    puan: int          # 1-5
    metin: Optional[str] = None


class YorumOut(BaseModel):
    id: int
    puan: int
    metin: Optional[str] = None
    kullanici_ad: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------
# SIPARIS semalari
# ---------------------------------------------------------------------

# Musteri siparis verirken her bir kalem
class KalemCreate(BaseModel):
    urun_id: int
    adet: int


class SiparisCreate(BaseModel):
    kalemler: list[KalemCreate]


# Disariya donerken
class KalemOut(BaseModel):
    ad: Optional[str] = None
    fiyat: Optional[float] = None
    adet: int

    class Config:
        from_attributes = True


class SiparisOut(BaseModel):
    id: int
    tarih: datetime
    durum: str
    toplam: Optional[float] = None
    kalemler: list[KalemOut] = []

    class Config:
        from_attributes = True


# Satici durumu guncellerken
class DurumUpdate(BaseModel):
    durum: str

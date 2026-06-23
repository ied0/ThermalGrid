"""
Veritabani tablolarinin Python karsiliklari (SQLAlchemy modelleri).
schema.sql'de SQL ile yazdigimiz tablolarin aynisini burada
Python sinifi olarak tanimliyoruz. Hepsini tek dosyada tuttum, proje kucuk.

Onemli kisim: cihazlar <-> urunler arasindaki COKA-COK iliski.
SQLAlchemy'de bunu "association table" (ara tablo) ile yapiyoruz.
"""

from sqlalchemy import Column, Integer, String, Numeric, Text, Table, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


# ---------------------------------------------------------------------
# ARA TABLO (junction) - cihaz_urun
# Bu sefer ayri bir sinif yazmiyoruz; sadece tablo tanimliyoruz.
# Cunku icinde fazladan kolon yok, sadece iki foreign key var.
# SQLAlchemy coka-cok iliskide bu tabloyu "secondary" olarak kullanacak.
# ---------------------------------------------------------------------
cihaz_urun = Table(
    "cihaz_urun",
    Base.metadata,
    Column("cihaz_id", Integer, ForeignKey("cihazlar.id", ondelete="CASCADE"), primary_key=True),
    Column("urun_id",  Integer, ForeignKey("urunler.id",  ondelete="CASCADE"), primary_key=True),
)


# ---------------------------------------------------------------------
# CIHAZ modeli = laptoplar tablosu
# ---------------------------------------------------------------------
class Cihaz(Base):
    __tablename__ = "cihazlar"

    id         = Column(Integer, primary_key=True, index=True)
    marka      = Column(String(50), nullable=False)
    model      = Column(String(100), nullable=False)
    islemci    = Column(String(100))
    isi_sorunu = Column(String(200))

    # Iliski: bir laptopun uyumlu urunleri.
    # secondary=cihaz_urun -> ara tablo uzerinden baglaniyor.
    # back_populates ile iki yonu birbirine baglıyoruz (Urun tarafindaki ile eslesiyor).
    urunler = relationship(
        "Urun",
        secondary=cihaz_urun,
        back_populates="cihazlar"
    )


# ---------------------------------------------------------------------
# URUN modeli = urunler tablosu
# ---------------------------------------------------------------------
class Urun(Base):
    __tablename__ = "urunler"

    id        = Column(Integer, primary_key=True, index=True)
    ad        = Column(String(100), nullable=False)
    kategori  = Column(String(50))
    fiyat     = Column(Numeric(8, 2))
    aciklama  = Column(Text)
    foto_url  = Column(String(300))                          # yuklenen gorselin yolu
    satici_id = Column(Integer, ForeignKey("users.id"))      # urunu ekleyen satici

    # Iliskinin diger ucu: bir urunun uydugu laptoplar.
    cihazlar = relationship(
        "Cihaz",
        secondary=cihaz_urun,
        back_populates="urunler"
    )

    # Bu urunun uygun oldugu laptop id'leri (duzenleme ekraninda lazim)
    @property
    def cihaz_idler(self):
        return [c.id for c in self.cihazlar]


# ---------------------------------------------------------------------
# USER modeli = kullanicilar tablosu
# rol: "musteri", "satici" veya "admin"
# ---------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    ad         = Column(String(100), nullable=False)
    email      = Column(String(120), unique=True, nullable=False, index=True)
    sifre_hash = Column(String(200), nullable=False)
    rol        = Column(String(20), nullable=False, default="musteri")
    adres      = Column(String(300))


# ---------------------------------------------------------------------
# YORUM modeli = kullanicilarin urunlere yaptigi yorumlar
# ---------------------------------------------------------------------
class Yorum(Base):
    __tablename__ = "yorumlar"

    id      = Column(Integer, primary_key=True, index=True)
    urun_id = Column(Integer, ForeignKey("urunler.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id"))
    puan    = Column(Integer, nullable=False)
    metin   = Column(Text)
    tarih   = Column(DateTime, server_default=func.now())

    kullanici = relationship("User")   # yorumu yazan kullaniciya ulasmak icin

    # Yorumu yazanin adini kolayca donmek icin (semada kullanacagiz)
    @property
    def kullanici_ad(self):
        return self.kullanici.ad if self.kullanici else "Anonim"


# ---------------------------------------------------------------------
# SIPARIS modelleri
# Bir siparisin birden cok kalemi var (bire-cok iliski).
# ---------------------------------------------------------------------
class Siparis(Base):
    __tablename__ = "siparisler"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tarih   = Column(DateTime, server_default=func.now())
    durum   = Column(String(20), nullable=False, default="hazirlaniyor")
    toplam  = Column(Numeric(10, 2))

    kalemler = relationship("SiparisKalem", back_populates="siparis", cascade="all, delete-orphan")


class SiparisKalem(Base):
    __tablename__ = "siparis_kalem"

    id         = Column(Integer, primary_key=True, index=True)
    siparis_id = Column(Integer, ForeignKey("siparisler.id", ondelete="CASCADE"))
    urun_id    = Column(Integer, ForeignKey("urunler.id"))
    ad         = Column(String(100))     # urun adinin o anki hali
    fiyat      = Column(Numeric(8, 2))   # o anki fiyat
    adet       = Column(Integer, nullable=False)

    siparis = relationship("Siparis", back_populates="kalemler")

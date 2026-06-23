"""
ThermalGrid backend - uygulamanin giris noktasi.
Calistirmak icin:  uvicorn app.main:app --reload

Burada cok is yapmiyoruz:
  - FastAPI uygulamasini olusturuyoruz
  - React (frontend) baska portta calisacagi icin CORS aciyoruz
  - router'lari (cihazlar, urunler) uygulamaya bagliyoruz
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import cihazlar, urunler, auth, admin, siparisler

app = FastAPI(title="ThermalGrid API")

# CORS: React frontend backend'e istek atarken tarayici engellemesin diye izin veriyoruz.
# Vercel'de frontend ayri bir domainde (ve preview deploy'larda domain her seferinde
# degisiyor), o yuzden tum origin'lere izin veriyoruz. Giris token'i Authorization
# header'inda gidiyor (cookie kullanmiyoruz) -> allow_credentials=False yeterli ve dogru.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'lari ekliyoruz
app.include_router(auth.router)
app.include_router(cihazlar.router)
app.include_router(urunler.router)
app.include_router(admin.router)
app.include_router(siparisler.router)

# Yuklenen fotograflari /static altinda disariya servis ediyoruz.
# Klasor yoksa olusturuyoruz ki StaticFiles hata vermesin.
os.makedirs("/tmp/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="/tmp"), name="static")


# Sunucu ayakta mi diye kontrol icin basit bir ana sayfa
@app.get("/")
def ana_sayfa():
    return {"mesaj": "ThermalGrid API calisiyor! Dokumantasyon: /docs"}

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

# CORS: React frontend (localhost:5173) backend'e (localhost:8000)
# istek atarken tarayici engellemesin diye izin veriyoruz.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],   # frontend bu portta calisiyor
    allow_credentials=True,
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
app.mount("/static", StaticFiles(directory="static"), name="static")


# Sunucu ayakta mi diye kontrol icin basit bir ana sayfa
@app.get("/")
def ana_sayfa():
    return {"mesaj": "ThermalGrid API calisiyor! Dokumantasyon: /docs"}

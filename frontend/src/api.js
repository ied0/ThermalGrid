// Backend'e istek atan yardimci fonksiyonlar tek yerde toplandi.
// Backend 8001'de calisiyor (8000'i baska proje kullaniyordu).
export const BASE_URL = "http://localhost:8001";

// foto_url backend'den "/static/uploads/x.png" gibi geliyor.
// Bunu tam adrese cevirmek icin kucuk yardimci (img src'de kullanacagiz).
export function fotoTamYol(foto_url) {
  return foto_url ? `${BASE_URL}${foto_url}` : null;
}

// localStorage'daki token'i Authorization header olarak dondur
function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

// ---- Laptop & urun istekleri ----
export async function getCihazlar() {
  const res = await fetch(`${BASE_URL}/cihazlar/`);
  if (!res.ok) throw new Error("Laptoplar yuklenemedi");
  return res.json();
}

export async function getCihazDetay(id) {
  const res = await fetch(`${BASE_URL}/cihazlar/${id}`);
  if (!res.ok) throw new Error("Laptop bulunamadi");
  return res.json();
}

export async function getUrunler() {
  const res = await fetch(`${BASE_URL}/urunler/`);
  if (!res.ok) throw new Error("Urunler yuklenemedi");
  return res.json();
}

// Tek urun
export async function getUrun(id) {
  const res = await fetch(`${BASE_URL}/urunler/${id}`);
  if (!res.ok) throw new Error("Urun bulunamadi");
  return res.json();
}

// Bir urunun yorumlari
export async function getYorumlar(urunId) {
  const res = await fetch(`${BASE_URL}/urunler/${urunId}/yorumlar`);
  if (!res.ok) throw new Error("Yorumlar yuklenemedi");
  return res.json();
}

// Yorum ekle (giris gerekli). veri = { puan, metin }
export async function yorumEkle(urunId, veri) {
  const res = await fetch(`${BASE_URL}/urunler/${urunId}/yorumlar`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Yorum eklenemedi");
  }
  return res.json();
}

// ---- Hesap (auth) istekleri ----

// Kayit ol. veri = { ad, email, sifre, rol }
export async function registerUser(veri) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Kayit basarisiz");
  }
  return res.json();
}

// Giris yap. Backend OAuth2 formu bekledigi icin form-urlencoded gonderiyoruz.
// Alan adi "username" ama icine email yaziyoruz (backend boyle istiyor).
export async function loginUser(email, sifre) {
  const govde = new URLSearchParams();
  govde.append("username", email);
  govde.append("password", sifre);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: govde,
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Giris basarisiz");
  }
  return res.json(); // { access_token, token_type, user }
}

// Token ile "ben kimim" bilgisini cek (sayfa yenilenince kullaniciyi geri yuklemek icin)
export async function getMe(token) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Oturum gecersiz");
  return res.json();
}

// ---- Profil istekleri (giris gerekli) ----

// Ad / email / adres guncelle. veri = { ad, email, adres }
export async function profilGuncelle(veri) {
  const res = await fetch(`${BASE_URL}/auth/profil`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Profil guncellenemedi");
  }
  return res.json();
}

// Sifre degistir. veri = { eski_sifre, yeni_sifre }
export async function sifreDegistir(veri) {
  const res = await fetch(`${BASE_URL}/auth/sifre`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Sifre degistirilemedi");
  }
  return res.json();
}

// ---- Siparis istekleri ----

// Sepetten siparis olustur. kalemler = [{ urun_id, adet }]
export async function siparisOlustur(kalemler) {
  const res = await fetch(`${BASE_URL}/siparisler/`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ kalemler }),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Siparis olusturulamadi");
  }
  return res.json();
}

// Musterinin kendi siparisleri
export async function getBenimSiparisler() {
  const res = await fetch(`${BASE_URL}/siparisler/benim`, { headers: authHeader() });
  if (!res.ok) throw new Error("Siparisler yuklenemedi");
  return res.json();
}

// Saticinin urununu iceren siparisler
export async function getSaticiSiparisler() {
  const res = await fetch(`${BASE_URL}/siparisler/satici`, { headers: authHeader() });
  if (!res.ok) throw new Error("Siparisler yuklenemedi");
  return res.json();
}

// Siparis durumunu guncelle (satici/admin)
export async function durumGuncelle(siparisId, durum) {
  const res = await fetch(`${BASE_URL}/siparisler/${siparisId}/durum`, {
    method: "PATCH",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ durum }),
  });
  if (!res.ok) throw new Error("Durum guncellenemedi");
  return res.json();
}

// ---- Admin istekleri (hepsi token + admin ister) ----

export async function cihazEkle(veri) {
  const res = await fetch(`${BASE_URL}/cihazlar/`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Laptop eklenemedi");
  }
  return res.json();
}

export async function cihazSil(id) {
  const res = await fetch(`${BASE_URL}/cihazlar/${id}`, { method: "DELETE", headers: authHeader() });
  if (!res.ok) throw new Error("Laptop silinemedi");
  return res.json();
}

export async function getKullanicilar() {
  const res = await fetch(`${BASE_URL}/admin/users`, { headers: authHeader() });
  if (!res.ok) throw new Error("Kullanicilar yuklenemedi");
  return res.json();
}

export async function kullaniciSil(id) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, { method: "DELETE", headers: authHeader() });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Kullanici silinemedi");
  }
  return res.json();
}

// ---- Satici istekleri (hepsi token ister) ----

// Saticinin kendi urunleri
export async function getBenimUrunler() {
  const res = await fetch(`${BASE_URL}/urunler/benim`, { headers: authHeader() });
  if (!res.ok) throw new Error("Urunler yuklenemedi");
  return res.json();
}

// Foto yukle. dosya = <input type=file>'dan gelen File nesnesi. foto_url doner.
export async function fotoYukle(dosya) {
  const form = new FormData();
  form.append("dosya", dosya);
  const res = await fetch(`${BASE_URL}/urunler/upload-foto`, {
    method: "POST",
    headers: authHeader(),   // Content-Type'i ELLE koymuyoruz, FormData kendi ayarliyor
    body: form,
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Foto yuklenemedi");
  }
  return res.json(); // { foto_url }
}

// Yeni urun ekle. veri = { ad, kategori, fiyat, aciklama, foto_url, cihaz_idler }
export async function urunEkle(veri) {
  const res = await fetch(`${BASE_URL}/urunler/`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Urun eklenemedi");
  }
  return res.json();
}

// Urun guncelle (sahibi/admin)
export async function urunGuncelle(id, veri) {
  const res = await fetch(`${BASE_URL}/urunler/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  });
  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata.detail || "Urun guncellenemedi");
  }
  return res.json();
}

// Urun sil (sahibi/admin)
export async function urunSil(id) {
  const res = await fetch(`${BASE_URL}/urunler/${id}`, { method: "DELETE", headers: authHeader() });
  if (!res.ok) throw new Error("Urun silinemedi");
  return res.json();
}

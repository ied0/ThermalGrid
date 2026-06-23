// Hesabim sayfasi: kullanici bilgileri + siparisleri tek yerde.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBenimSiparisler, profilGuncelle, sifreDegistir } from "../api";
import { durumEtiketi } from "./OrdersPage";

// Rol adini guzel yazalim
function rolYazi(rol) {
  if (rol === "satici") return "Satici";
  if (rol === "admin") return "Yonetici";
  return "Musteri";
}

function ProfilePage() {
  const { user, logout, kullaniciGuncelle } = useAuth();
  const [siparisler, setSiparisler] = useState([]);

  // Bilgi duzenleme formu
  const [bilgi, setBilgi] = useState({ ad: "", email: "", adres: "" });
  const [bilgiMesaj, setBilgiMesaj] = useState(null);

  // Sifre degistirme formu
  const [sifre, setSifre] = useState({ eski_sifre: "", yeni_sifre: "" });
  const [sifreMesaj, setSifreMesaj] = useState(null);

  useEffect(() => {
    if (user) {
      getBenimSiparisler().then(setSiparisler).catch(() => {});
      // Formu mevcut bilgilerle doldur
      setBilgi({ ad: user.ad, email: user.email, adres: user.adres || "" });
    }
  }, [user]);

  async function bilgiKaydet(e) {
    e.preventDefault();
    setBilgiMesaj(null);
    try {
      const guncel = await profilGuncelle(bilgi);
      kullaniciGuncelle(guncel);   // header'daki isim de yenilensin
      setBilgiMesaj({ tip: "ok", metin: "Bilgiler guncellendi ✓" });
    } catch (err) {
      setBilgiMesaj({ tip: "hata", metin: err.message });
    }
  }

  async function sifreKaydet(e) {
    e.preventDefault();
    setSifreMesaj(null);
    try {
      await sifreDegistir(sifre);
      setSifre({ eski_sifre: "", yeni_sifre: "" });
      setSifreMesaj({ tip: "ok", metin: "Sifre degistirildi ✓" });
    } catch (err) {
      setSifreMesaj({ tip: "hata", metin: err.message });
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Hesabini gormek icin <Link to="/login" className="text-cyan-600 font-medium">giris yap</Link>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Hesabim</h2>

      {/* Bilgi karti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        {/* Bas harfli yuvarlak avatar */}
        <div className="w-14 h-14 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl font-bold">
          {user.ad.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-800">{user.ad}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.adres && <p className="text-sm text-gray-500">📍 {user.adres}</p>}
          <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{rolYazi(user.rol)}</span>
        </div>
        <button onClick={logout} className="text-red-500 hover:text-red-600 text-sm">Cikis Yap</button>
      </div>

      {/* ---- BILGI DUZENLEME + SIFRE ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Bilgileri duzenle */}
        <form onSubmit={bilgiKaydet} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
          <h3 className="font-bold text-slate-700 text-sm">Bilgilerimi Duzenle</h3>
          {bilgiMesaj && (
            <p className={`text-sm rounded p-2 ${bilgiMesaj.tip === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{bilgiMesaj.metin}</p>
          )}
          <input value={bilgi.ad} onChange={(e) => setBilgi({ ...bilgi, ad: e.target.value })} required placeholder="Ad Soyad"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <input type="email" value={bilgi.email} onChange={(e) => setBilgi({ ...bilgi, email: e.target.value })} required placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <textarea value={bilgi.adres} onChange={(e) => setBilgi({ ...bilgi, adres: e.target.value })} rows="2" placeholder="Adres"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2 rounded-lg text-sm">Kaydet</button>
        </form>

        {/* Sifre degistir */}
        <form onSubmit={sifreKaydet} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
          <h3 className="font-bold text-slate-700 text-sm">Sifre Degistir</h3>
          {sifreMesaj && (
            <p className={`text-sm rounded p-2 ${sifreMesaj.tip === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{sifreMesaj.metin}</p>
          )}
          <input type="password" value={sifre.eski_sifre} onChange={(e) => setSifre({ ...sifre, eski_sifre: e.target.value })} required placeholder="Mevcut sifre"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <input type="password" value={sifre.yeni_sifre} onChange={(e) => setSifre({ ...sifre, yeni_sifre: e.target.value })} required placeholder="Yeni sifre"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg text-sm">Sifreyi Degistir</button>
        </form>
      </div>

      {/* Siparisler */}
      <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">Siparislerim ({siparisler.length})</h3>

      {siparisler.length === 0 ? (
        <p className="text-gray-500">Henuz siparisin yok. <Link to="/" className="text-cyan-600">Alisverise basla</Link></p>
      ) : (
        <div className="space-y-4">
          {siparisler.map((s) => {
            const e = durumEtiketi(s.durum);
            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Siparis #{s.id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${e.renk}`}>{e.yazi}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {s.kalemler.map((k, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{k.ad} × {k.adet}</span>
                      <span>{k.fiyat * k.adet} TL</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t mt-2 pt-2 font-bold text-slate-800">
                  <span>Toplam</span>
                  <span>{s.toplam} TL</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

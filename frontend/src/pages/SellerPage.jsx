// Satici paneli ("Urunlerim"). Sadece satici/admin gorebilir.
// Solda urun ekleme formu (fotograf + uygun laptop secimi), altta kendi urunleri.
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCihazlar, getBenimUrunler, fotoYukle, urunEkle, urunGuncelle, urunSil, fotoTamYol,
         getSaticiSiparisler, durumGuncelle } from "../api";
import { durumEtiketi } from "./OrdersPage";

// Durumun bir sonraki adimi (Hazirlaniyor -> Kargoda -> Teslim)
const SONRAKI = { hazirlaniyor: "kargoda", kargoda: "teslim" };

function SellerPage() {
  const { user } = useAuth();

  const [cihazlar, setCihazlar] = useState([]);     // laptop secimi icin
  const [urunlerim, setUrunlerim] = useState([]);   // saticinin kendi urunleri
  const [siparisler, setSiparisler] = useState([]); // gelen siparisler

  // Form alanlari
  const [form, setForm] = useState({ ad: "", kategori: "termal_macun", fiyat: "", aciklama: "" });
  const [dosya, setDosya] = useState(null);          // secilen foto
  const [secilenCihazlar, setSecilenCihazlar] = useState([]); // isaretli laptop id'leri
  const [mesaj, setMesaj] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState(null);  // null=yeni ekleme, id=duzenleme

  // Kendi urunlerini ve laptop listesini yukle
  function urunleriYukle() {
    getBenimUrunler().then(setUrunlerim).catch(() => {});
  }
  function siparisleriYukle() {
    getSaticiSiparisler().then(setSiparisler).catch(() => {});
  }
  useEffect(() => {
    getCihazlar().then(setCihazlar).catch(() => {});
    urunleriYukle();
    siparisleriYukle();
  }, []);

  // Durumu bir sonraki adima tasi (buton)
  async function durumIlerlet(siparis) {
    const yeni = SONRAKI[siparis.durum];
    if (!yeni) return;
    await durumGuncelle(siparis.id, yeni);
    siparisleriYukle();
  }

  // Satici/admin degilse iceri alma
  if (!user || (user.rol !== "satici" && user.rol !== "admin")) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold text-slate-800 mt-3">Bu sayfa saticilara ozel</h2>
        <p className="text-gray-500 mt-1">Satici hesabiyla giris yapman gerekiyor.</p>
      </div>
    );
  }

  function degis(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Bir laptopun kutucugu isaretlenince listeye ekle/cikar
  function cihazSec(id) {
    setSecilenCihazlar((onceki) =>
      onceki.includes(id) ? onceki.filter((x) => x !== id) : [...onceki, id]
    );
  }

  // Formu temizle (yeni ekleme moduna don)
  function formuSifirla() {
    setForm({ ad: "", kategori: "termal_macun", fiyat: "", aciklama: "" });
    setDosya(null);
    setSecilenCihazlar([]);
    setDuzenlenenId(null);
  }

  // "Duzenle"ye basilinca formu o urunle doldur
  function duzenleBaslat(u) {
    setForm({ ad: u.ad, kategori: u.kategori, fiyat: u.fiyat, aciklama: u.aciklama || "" });
    setSecilenCihazlar(u.cihaz_idler || []);
    setDosya(null);
    setDuzenlenenId(u.id);
    setMesaj(null);
  }

  async function urunuSil(id) {
    if (!confirm("Bu urun silinsin mi?")) return;
    await urunSil(id);
    if (duzenlenenId === id) formuSifirla();
    urunleriYukle();
  }

  async function gonder(e) {
    e.preventDefault();
    setMesaj(null);
    setKaydediliyor(true);
    try {
      // Once foto varsa onu yukle, foto_url'i al
      let foto_url = null;
      if (dosya) {
        const sonuc = await fotoYukle(dosya);
        foto_url = sonuc.foto_url;
      }
      const govde = {
        ad: form.ad,
        kategori: form.kategori,
        fiyat: parseFloat(form.fiyat),
        aciklama: form.aciklama,
        foto_url,
        cihaz_idler: secilenCihazlar,
      };

      if (duzenlenenId) {
        await urunGuncelle(duzenlenenId, govde);
        setMesaj({ tip: "ok", metin: "Urun guncellendi! ✏️" });
      } else {
        await urunEkle(govde);
        setMesaj({ tip: "ok", metin: "Urun eklendi! 🎉" });
      }
      formuSifirla();
      urunleriYukle();
    } catch (err) {
      setMesaj({ tip: "hata", metin: err.message });
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Urunlerim</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- URUN EKLEME FORMU ---- */}
        <div className="lg:col-span-1">
          <form onSubmit={gonder} className="bg-white rounded-xl shadow p-5 space-y-3 sticky top-20">
            <h3 className="font-bold text-slate-800">
              {duzenlenenId ? "Urunu Duzenle" : "Yeni Urun Ekle"}
            </h3>

            {mesaj && (
              <p className={`text-sm rounded p-2 ${mesaj.tip === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {mesaj.metin}
              </p>
            )}

            <input name="ad" value={form.ad} onChange={degis} required placeholder="Urun adi"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />

            <select name="kategori" value={form.kategori} onChange={degis}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <option value="termal_macun">Termal Macun</option>
              <option value="sogutucu_ped">Sogutucu Ped</option>
              <option value="rehber">Rehber</option>
            </select>

            <input name="fiyat" type="number" step="0.01" value={form.fiyat} onChange={degis} required placeholder="Fiyat (TL)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />

            <textarea name="aciklama" value={form.aciklama} onChange={degis} required placeholder="Aciklama" rows="2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />

            {/* Foto secimi */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Urun fotografi</label>
              <input type="file" accept="image/*" onChange={(e) => setDosya(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-cyan-50 file:text-cyan-700" />
            </div>

            {/* Uygun laptoplar (coka-cok) */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hangi laptoplara uygun?</label>
              <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {cihazlar.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={secilenCihazlar.includes(c.id)} onChange={() => cihazSec(c.id)} />
                    {c.marka} {c.model}
                  </label>
                ))}
              </div>
            </div>

            <button disabled={kaydediliyor}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition">
              {kaydediliyor ? "Kaydediliyor..." : duzenlenenId ? "Degisiklikleri Kaydet" : "Urunu Ekle"}
            </button>
            {/* Duzenleme modundaysa vazgec butonu */}
            {duzenlenenId && (
              <button type="button" onClick={formuSifirla}
                className="w-full text-gray-500 text-sm hover:text-gray-700">
                Vazgec
              </button>
            )}
            {/* Duzenlerken: yeni foto secmezsen mevcut foto korunur */}
            {duzenlenenId && (
              <p className="text-xs text-gray-400">Yeni foto secmezsen eski foto kalir.</p>
            )}
          </form>
        </div>

        {/* ---- KENDI URUNLERI ---- */}
        <div className="lg:col-span-2">
          {urunlerim.length === 0 ? (
            <p className="text-gray-500">Henuz urun eklemedin. Soldaki formla ilk urununu ekle 👈</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {urunlerim.map((u) => (
                <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Foto varsa goster, yoksa placeholder */}
                  {u.foto_url ? (
                    <img src={fotoTamYol(u.foto_url)} alt={u.ad} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-cyan-100 flex items-center justify-center text-4xl">📦</div>
                  )}
                  <div className="p-3">
                    <h4 className="font-semibold text-slate-800 text-sm">{u.ad}</h4>
                    <p className="text-xs text-gray-500">{u.fiyat} TL</p>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => duzenleBaslat(u)} className="text-cyan-600 hover:text-cyan-500 text-sm">Duzenle</button>
                      <button onClick={() => urunuSil(u.id)} className="text-red-500 hover:text-red-600 text-sm">Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- GELEN SIPARISLER ---- */}
      <h3 className="font-bold text-slate-700 mt-10 mb-3">Gelen Siparisler</h3>
      {siparisler.length === 0 ? (
        <p className="text-gray-500 text-sm">Henuz siparis yok.</p>
      ) : (
        <div className="space-y-3">
          {siparisler.map((s) => {
            const e = durumEtiketi(s.durum);
            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Siparis #{s.id}</span>
                  <p className="text-xs text-gray-500">
                    {s.kalemler.map((k) => `${k.ad} x${k.adet}`).join(", ")} · {s.toplam} TL
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded ${e.renk}`}>{e.yazi}</span>
                  {/* Teslim degilse bir sonraki duruma gecir */}
                  {SONRAKI[s.durum] && (
                    <button onClick={() => durumIlerlet(s)}
                      className="text-sm bg-slate-800 text-white px-3 py-1 rounded-lg hover:bg-slate-700">
                      {SONRAKI[s.durum] === "kargoda" ? "Kargoya Ver" : "Teslim Et"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SellerPage;

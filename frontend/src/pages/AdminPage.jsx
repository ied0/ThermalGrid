// Admin paneli. Sadece admin gorebilir.
// Iki bolum: laptop ekle/sil ve kullanici listesi/sil.
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCihazlar, cihazEkle, cihazSil, getKullanicilar, kullaniciSil } from "../api";

function AdminPage() {
  const { user } = useAuth();

  const [cihazlar, setCihazlar] = useState([]);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [form, setForm] = useState({ marka: "", model: "", islemci: "", isi_sorunu: "" });
  const [hata, setHata] = useState(null);

  function yukle() {
    getCihazlar().then(setCihazlar).catch(() => {});
    getKullanicilar().then(setKullanicilar).catch(() => {});
  }
  useEffect(() => { yukle(); }, []);

  // Admin degilse iceri alma
  if (!user || user.rol !== "admin") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold text-slate-800 mt-3">Bu sayfa admin'e ozel</h2>
      </div>
    );
  }

  function degis(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function laptopEkle(e) {
    e.preventDefault();
    setHata(null);
    try {
      await cihazEkle(form);
      setForm({ marka: "", model: "", islemci: "", isi_sorunu: "" });
      yukle();
    } catch (err) {
      setHata(err.message);
    }
  }

  async function laptopSil(id) {
    if (!confirm("Bu laptop silinsin mi?")) return;
    await cihazSil(id);
    yukle();
  }

  async function userSil(id) {
    if (!confirm("Bu kullanici silinsin mi?")) return;
    try {
      await kullaniciSil(id);
      yukle();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Yonetim Paneli</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- LAPTOPLAR ---- */}
        <div>
          <h3 className="font-bold text-slate-700 mb-3">Laptoplar</h3>

          {/* Ekleme formu */}
          <form onSubmit={laptopEkle} className="bg-white rounded-xl shadow p-4 space-y-2 mb-4">
            {hata && <p className="text-red-600 text-sm bg-red-50 rounded p-2">{hata}</p>}
            <input name="marka" value={form.marka} onChange={degis} required placeholder="Marka (orn: MSI)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <input name="model" value={form.model} onChange={degis} required placeholder="Model (orn: GF65 Thin)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <input name="islemci" value={form.islemci} onChange={degis} placeholder="Islemci (orn: Intel i7-10750H)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <input name="isi_sorunu" value={form.isi_sorunu} onChange={degis} placeholder="Bilinen isinma sorunu"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2 rounded-lg text-sm">
              Laptop Ekle
            </button>
          </form>

          {/* Liste */}
          <div className="space-y-2">
            {cihazlar.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex justify-between items-center">
                <span className="text-sm text-slate-800">{c.marka} {c.model}</span>
                <button onClick={() => laptopSil(c.id)} className="text-red-500 hover:text-red-600 text-sm">Sil</button>
              </div>
            ))}
          </div>
        </div>

        {/* ---- KULLANICILAR ---- */}
        <div>
          <h3 className="font-bold text-slate-700 mb-3">Kullanicilar</h3>
          <div className="space-y-2">
            {kullanicilar.map((k) => (
              <div key={k.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-800">{k.ad}</span>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{k.rol}</span>
                </div>
                <button onClick={() => userSil(k.id)} className="text-red-500 hover:text-red-600 text-sm">Sil</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

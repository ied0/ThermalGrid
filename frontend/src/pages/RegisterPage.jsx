// Kayit sayfasi. Ad, email, sifre ve rol (musteri/satici) alip kayit yapiyor.
// Kayit sonrasi AuthContext otomatik giris de yapiyor.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ad: "", email: "", sifre: "", rol: "musteri" });
  const [hata, setHata] = useState(null);

  // Tek fonksiyonla butun inputlari guncelliyoruz (name'e gore)
  function degis(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function gonder(e) {
    e.preventDefault();
    setHata(null);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setHata(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Kayit Ol</h2>
        <p className="text-gray-500 text-sm mb-6">Hemen bir hesap olustur.</p>

        {hata && <p className="text-red-600 bg-red-50 rounded p-2 text-sm mb-4">{hata}</p>}

        <form onSubmit={gonder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
            <input name="ad" value={form.ad} onChange={degis} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={degis} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sifre</label>
            <input name="sifre" type="password" value={form.sifre} onChange={degis} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          </div>

          {/* Rol secimi: musteri mi satici mi? (admin burada YOK, o elle veriliyor) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hesap turu</label>
            <select name="rol" value={form.rol} onChange={degis}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <option value="musteri">Musteri (alisveris yapacagim)</option>
              <option value="satici">Satici (urun satacagim)</option>
            </select>
          </div>

          <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2 rounded-lg transition">
            Kayit Ol
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Zaten hesabin var mi?{" "}
          <Link to="/login" className="text-cyan-600 font-medium">Giris yap</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

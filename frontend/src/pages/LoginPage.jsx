// Giris sayfasi. Email + sifre alip AuthContext'teki login()'i cagiriyor.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState(null);

  async function gonder(e) {
    e.preventDefault(); // formun sayfayi yenilemesini engelle
    setHata(null);
    try {
      await login(email, sifre);
      navigate("/"); // giris basarili -> ana sayfaya don
    } catch (err) {
      setHata(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Giris Yap</h2>
        <p className="text-gray-500 text-sm mb-6">Hesabina giris yaparak alisverise devam et.</p>

        {hata && <p className="text-red-600 bg-red-50 rounded p-2 text-sm mb-4">{hata}</p>}

        <form onSubmit={gonder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="ornek@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="••••••"
            />
          </div>
          <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2 rounded-lg transition">
            Giris Yap
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Hesabin yok mu?{" "}
          <Link to="/register" className="text-cyan-600 font-medium">Kayit ol</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

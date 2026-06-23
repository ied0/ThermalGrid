// Tek urun sayfasi: urun bilgisi + yorumlar + yorum ekleme.
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getUrun, getYorumlar, yorumEkle, fotoTamYol } from "../api";

// Puana gore yildiz yazisi (orn 4 -> ★★★★☆)
function yildizlar(puan) {
  return "★★★★★☆☆☆☆☆".slice(5 - puan, 10 - puan);
}

function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { ekle } = useCart();

  const [urun, setUrun] = useState(null);
  const [yorumlar, setYorumlar] = useState([]);
  const [puan, setPuan] = useState(5);
  const [metin, setMetin] = useState("");
  const [hata, setHata] = useState(null);

  function yorumlariYukle() {
    getYorumlar(id).then(setYorumlar).catch(() => {});
  }
  useEffect(() => {
    getUrun(id).then(setUrun).catch(() => {});
    yorumlariYukle();
  }, [id]);

  async function gonder(e) {
    e.preventDefault();
    setHata(null);
    try {
      await yorumEkle(id, { puan, metin });
      setMetin("");
      setPuan(5);
      yorumlariYukle();
    } catch (err) {
      setHata(err.message);
    }
  }

  if (!urun) return <p className="max-w-3xl mx-auto px-4 py-12 text-gray-500">Yukleniyor...</p>;

  // Ortalama puan
  const ortalama = yorumlar.length
    ? (yorumlar.reduce((t, y) => t + y.puan, 0) / yorumlar.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-cyan-600 text-sm">← Ana sayfa</Link>

      {/* Urun karti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-3">
        {urun.foto_url && (
          <img src={fotoTamYol(urun.foto_url)} alt={urun.ad} className="w-full h-52 object-cover" />
        )}
        <div className="p-5">
          <h2 className="text-2xl font-bold text-slate-800">{urun.ad}</h2>
          <p className="text-gray-600 mt-1">{urun.aciklama}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-extrabold text-slate-800">
              {urun.fiyat > 0 ? `${urun.fiyat} TL` : "Ucretsiz"}
            </span>
            <button onClick={() => ekle(urun)}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-lg">
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Yorumlar basligi + ortalama */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <h3 className="text-xl font-bold text-slate-800">Yorumlar ({yorumlar.length})</h3>
        {ortalama && (
          <span className="text-amber-500 font-semibold">
            {yildizlar(Math.round(ortalama))} {ortalama}
          </span>
        )}
      </div>

      {/* Yorum ekleme formu - sadece giris yapmissa */}
      {user ? (
        <form onSubmit={gonder} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-1 mb-2">
            {/* Yildizlara tiklayarak puan ver */}
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setPuan(n)}
                className={`text-2xl ${n <= puan ? "text-amber-400" : "text-gray-300"}`}>
                ★
              </button>
            ))}
          </div>
          <textarea value={metin} onChange={(e) => setMetin(e.target.value)} rows="2"
            placeholder="Yorumunu yaz..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          {hata && <p className="text-red-600 text-sm mt-1">{hata}</p>}
          <button className="mt-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-lg text-sm">
            Yorumu Gonder
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          Yorum yapmak icin <Link to="/login" className="text-cyan-600 font-medium">giris yap</Link>.
        </p>
      )}

      {/* Yorum listesi */}
      <div className="space-y-3">
        {yorumlar.length === 0 && <p className="text-gray-500 text-sm">Henuz yorum yok, ilk yorumu sen yap!</p>}
        {yorumlar.map((y) => (
          <div key={y.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{y.kullanici_ad}</span>
              <span className="text-amber-500">{yildizlar(y.puan)}</span>
            </div>
            {y.metin && <p className="text-gray-600 text-sm mt-1">{y.metin}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductPage;

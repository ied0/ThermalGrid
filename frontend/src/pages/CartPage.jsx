// Sepet sayfasi. CartContext'teki urunleri listeliyor, cikarma ve
// toplam tutar gosteriyor. "Siparisi tamamla" simdilik sadece sepeti
// temizleyip tesekkur mesaji veriyor (odeme sistemi dersin konusu degil).
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function CartPage() {
  const { sepet, cikar, toplamTutar } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Giris yoksa login'e, varsa odeme sayfasina git
  function odemeyeGec() {
    navigate(user ? "/odeme" : "/login");
  }

  // Sepet bossa
  if (sepet.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h2 className="text-xl font-bold text-slate-800 mt-4">Sepetin bos</h2>
        <p className="text-gray-500 mt-1">Hadi birkac sogutma urunu ekleyelim.</p>
        <Link to="/" className="inline-block mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-lg">
          Alisverise Basla
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Sepetim</h2>

      <div className="space-y-3">
        {sepet.map((urun) => (
          <div key={urun.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-800">{urun.ad}</h4>
              <p className="text-sm text-gray-500">
                {urun.adet} adet × {urun.fiyat} TL
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800">{urun.fiyat * urun.adet} TL</span>
              <button onClick={() => cikar(urun.id)}
                className="text-red-500 hover:text-red-600 text-sm">
                Kaldir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toplam + butonlar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-4">
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium text-slate-600">Toplam</span>
          <span className="font-extrabold text-slate-800">{toplamTutar} TL</span>
        </div>
        <button
          onClick={odemeyeGec}
          className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-3 rounded-lg">
          {user ? "Odemeye Gec" : "Siparis icin giris yap"}
        </button>
      </div>
    </div>
  );
}

export default CartPage;

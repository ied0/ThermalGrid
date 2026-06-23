// Tek bir urunu gosteren kart. CihazDetay sayfasinda, secilen laptopa
// uygun her urun icin tekrar kullaniliyor.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fotoTamYol } from "../api";

// Kategoriye gore hem renkli etiket hem de ikon dondurelim, daha sirin dursun
function kategoriBilgi(kategori) {
  if (kategori === "termal_macun") return { yazi: "Termal Macun", renk: "bg-orange-100 text-orange-700", ikon: "🧴" };
  if (kategori === "sogutucu_ped") return { yazi: "Sogutucu Ped", renk: "bg-blue-100 text-blue-700", ikon: "💨" };
  if (kategori === "rehber")       return { yazi: "Rehber", renk: "bg-green-100 text-green-700", ikon: "📘" };
  return { yazi: kategori, renk: "bg-gray-100 text-gray-700", ikon: "📦" };
}

function UrunKart({ urun }) {
  const k = kategoriBilgi(urun.kategori);
  const { ekle } = useCart();
  const [eklendi, setEklendi] = useState(false);

  // Sepete ekle: kisa bir "Eklendi ✓" geri bildirimi gosteriyoruz
  function sepeteEkle() {
    ekle(urun);
    setEklendi(true);
    setTimeout(() => setEklendi(false), 1500);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
      {/* Foto yuklenmisse gercek gorsel, yoksa kategori ikonu (placeholder) */}
      {urun.foto_url ? (
        <div className="relative -mx-4 -mt-4 mb-3">
          <img src={fotoTamYol(urun.foto_url)} alt={urun.ad} className="w-full h-32 object-cover rounded-t-xl" />
          <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${k.renk}`}>{k.yazi}</span>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-3xl">{k.ikon}</span>
          <span className={`text-xs px-2 py-1 rounded ${k.renk}`}>{k.yazi}</span>
        </div>
      )}

      <Link to={`/urun/${urun.id}`} className="font-semibold text-slate-800 mt-3 hover:text-cyan-600">
        {urun.ad}
      </Link>
      <p className="text-sm text-gray-600 mt-1 flex-1">{urun.aciklama}</p>

      {/* Alt kisim: fiyat + sepete ekle butonu */}
      <div className="flex items-center justify-between mt-4">
        <span className="font-bold text-slate-800">
          {urun.fiyat > 0 ? `${urun.fiyat} TL` : "Ucretsiz"}
        </span>
        <button onClick={sepeteEkle}
          className={`text-white text-sm font-medium px-3 py-2 rounded-lg transition ${eklendi ? "bg-green-500" : "bg-cyan-500 hover:bg-cyan-400"}`}>
          {eklendi ? "Eklendi ✓" : (urun.fiyat > 0 ? "Sepete Ekle" : "Indir")}
        </button>
      </div>
    </div>
  );
}

export default UrunKart;

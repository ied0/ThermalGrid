// Tek bir laptopu gosteren urun karti. Gercek bir e-ticaret karti gibi:
// ustte gorsel alani (elimizde foto yok, o yuzden gradient + ikon koyduk),
// altta model bilgisi ve "incele" butonu. Karta tiklayinca detay sayfasina gidiyor.
import { Link } from "react-router-dom";

function CihazKart({ cihaz }) {
  return (
    <Link
      to={`/cihaz/${cihaz.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden border border-gray-100 flex flex-col"
    >
      {/* Gorsel alani (placeholder). Marka rozeti ustte. */}
      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-cyan-100 flex items-center justify-center">
        <span className="text-5xl group-hover:scale-110 transition-transform">💻</span>
        <span className="absolute top-2 left-2 bg-white/80 backdrop-blur text-slate-700 text-xs font-semibold px-2 py-1 rounded">
          {cihaz.marka}
        </span>
      </div>

      {/* Govde */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800">{cihaz.model}</h3>
        <p className="text-xs text-gray-500 mt-1">{cihaz.islemci}</p>

        {/* Isinma sorunu kucuk bir uyari etiketi olarak */}
        {cihaz.isi_sorunu && (
          <p className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 mt-3">
            🔥 {cihaz.isi_sorunu}
          </p>
        )}

        {/* mt-auto ile butonu hep en alta yapistiriyoruz (kartlar esit boyda dursun) */}
        <span className="mt-auto pt-4 text-cyan-600 text-sm font-semibold group-hover:text-cyan-500">
          Uygun urunleri gor →
        </span>
      </div>
    </Link>
  );
}

export default CihazKart;

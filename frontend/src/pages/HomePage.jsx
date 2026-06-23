// Ana sayfa: ustte tanitim (hero) bolumu, altinda laptoplari grid seklinde listeliyor.
import { useState, useEffect } from "react";
import { getCihazlar } from "../api";
import CihazKart from "../components/CihazKart";

function HomePage() {
  const [cihazlar, setCihazlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [arama, setArama] = useState("");   // arama kutusu metni

  useEffect(() => {
    getCihazlar()
      .then((veri) => setCihazlar(veri))
      .catch((err) => setHata(err.message))
      .finally(() => setYukleniyor(false));
  }, []);

  return (
    <div>
      {/* ----- HERO / KAPAK BOLUMU ----- */}
      {/* Soguk hava temasi icin cyan-slate gradient kullandik */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-cyan-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-white/10 text-cyan-200 text-xs px-3 py-1 rounded-full mb-4">
            ❄️ Termal performans uzmani
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            Laptopun mu isiniyor? <br />
            <span className="text-cyan-300">Cozumu burada.</span>
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto">
            Modeline ozel termal macun, sogutucu ped ve undervolting rehberleri.
            Once laptopunu sec, sana uygun urunleri listeleyelim.
          </p>
          <a
            href="#laptoplar"
            className="inline-block mt-6 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Laptopları Kesfet ↓
          </a>
        </div>
      </section>

      {/* ----- KUCUK AVANTAJ SERIDI ----- */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x text-center">
          <div className="p-4">
            <p className="text-2xl">🌡️</p>
            <p className="font-semibold text-slate-800 text-sm mt-1">Modeline Ozel</p>
            <p className="text-xs text-gray-500">Sadece uyumlu urunler</p>
          </div>
          <div className="p-4">
            <p className="text-2xl">🚚</p>
            <p className="font-semibold text-slate-800 text-sm mt-1">Hizli Kargo</p>
            <p className="text-xs text-gray-500">Ayni gun gonderim</p>
          </div>
          <div className="p-4">
            <p className="text-2xl">📘</p>
            <p className="font-semibold text-slate-800 text-sm mt-1">Ucretsiz Rehberler</p>
            <p className="text-xs text-gray-500">Undervolting anlatimi</p>
          </div>
        </div>
      </div>

      {/* ----- LAPTOP LISTESI ----- */}
      <section id="laptoplar" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Laptop Modelleri</h2>
        <p className="text-gray-500 mb-4">
          Laptopuna tikla, sana ozel sogutma cozumlerini gorelim.
        </p>

        {/* Arama kutusu - marka veya modele gore filtreliyor */}
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="🔍 Laptop ara (orn: MSI, Legion)..."
          className="w-full sm:max-w-sm mb-6 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        {yukleniyor && <p className="text-gray-500">Yukleniyor...</p>}
        {hata && (
          <p className="text-red-600 bg-red-50 rounded p-3">
            Hata: {hata} (Backend calisiyor mu?)
          </p>
        )}

        {/* Arama metnine gore filtrele (marka + model birlesik) */}
        {(() => {
          const sonuc = cihazlar.filter((c) =>
            `${c.marka} ${c.model}`.toLowerCase().includes(arama.toLowerCase())
          );
          if (!yukleniyor && sonuc.length === 0)
            return <p className="text-gray-500">Aramana uygun laptop bulunamadi.</p>;
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sonuc.map((cihaz) => (
                <CihazKart key={cihaz.id} cihaz={cihaz} />
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}

export default HomePage;

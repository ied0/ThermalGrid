// Laptop detay sayfasi. URL'deki id'yi alip o laptopun bilgilerini VE
// ona uygun urunleri backend'den cekiyoruz. Backend urunleri ic ice
// gonderdigi icin (coka-cok iliski) ekstra sorgu atmiyoruz.
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCihazDetay } from "../api";
import UrunKart from "../components/UrunKart";

function CihazDetay() {
  const { id } = useParams();
  const [cihaz, setCihaz] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [kategori, setKategori] = useState("hepsi");   // secili kategori filtresi

  useEffect(() => {
    setYukleniyor(true);
    getCihazDetay(id)
      .then((veri) => setCihaz(veri))
      .catch((err) => setHata(err.message))
      .finally(() => setYukleniyor(false));
  }, [id]);

  if (yukleniyor) return <p className="max-w-6xl mx-auto px-4 py-12 text-gray-500">Yukleniyor...</p>;
  if (hata) return <p className="max-w-6xl mx-auto px-4 py-12 text-red-600">Hata: {hata}</p>;

  return (
    <div>
      {/* ----- LAPTOP BASLIK BANNER'I ----- */}
      <section className="bg-gradient-to-br from-slate-800 to-cyan-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Link to="/" className="text-cyan-200 text-sm hover:text-white">← Tum laptoplar</Link>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-5xl">💻</span>
            <div>
              <p className="text-cyan-300 text-sm">{cihaz.marka}</p>
              <h2 className="text-3xl font-extrabold">{cihaz.model}</h2>
              <p className="text-slate-300 text-sm">{cihaz.islemci}</p>
            </div>
          </div>
          {cihaz.isi_sorunu && (
            <p className="text-sm bg-white/10 rounded px-3 py-2 mt-4 inline-block">
              🔥 Bilinen sorun: {cihaz.isi_sorunu}
            </p>
          )}
        </div>
      </section>

      {/* ----- UYGUN URUNLER (coka-cok iliskinin sonucu) ----- */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h3 className="text-xl font-bold text-slate-800 mb-3">
          Bu modele uygun urunler
        </h3>

        {/* Kategori filtre butonlari */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { deger: "hepsi", yazi: "Tumu" },
            { deger: "termal_macun", yazi: "Termal Macun" },
            { deger: "sogutucu_ped", yazi: "Sogutucu Ped" },
            { deger: "rehber", yazi: "Rehber" },
          ].map((k) => (
            <button key={k.deger} onClick={() => setKategori(k.deger)}
              className={`text-sm px-3 py-1 rounded-full border ${
                kategori === k.deger
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white text-slate-600 border-gray-300 hover:border-cyan-400"
              }`}>
              {k.yazi}
            </button>
          ))}
        </div>

        {(() => {
          // Secili kategoriye gore filtrele (hepsi ise tumunu goster)
          const urunler = kategori === "hepsi"
            ? cihaz.urunler
            : cihaz.urunler.filter((u) => u.kategori === kategori);

          if (urunler.length === 0)
            return <p className="text-gray-500">Bu kategoride urun yok.</p>;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {urunler.map((urun) => (
                <UrunKart key={urun.id} urun={urun} />
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}

export default CihazDetay;

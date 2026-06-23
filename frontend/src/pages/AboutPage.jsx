// Hakkimizda sayfasi. Tamamen statik (veri cekmiyor), proje tanitimi.
function AboutPage() {
  return (
    <div>
      {/* Ust banner */}
      <section className="bg-gradient-to-br from-slate-800 to-cyan-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-5xl">❄️</p>
          <h1 className="text-3xl font-extrabold mt-3">Hakkimizda</h1>
          <p className="text-slate-300 mt-2">Laptopunu serin tutmak icin buradayiz.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-slate-800 text-lg mb-2">Biz Kimiz?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            ThermalGrid, laptop isinma sorunlarina cozum bulan kucuk bir ekip.
            Termal macundan sogutucu pede, undervolting rehberlerinden bakim
            urunlerine kadar laptopunun ihtiyaci olan her seyi modeline gore oneriyoruz.
          </p>
        </div>

        {/* Kucuk istatistik seridi */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-extrabold text-cyan-600">4+</p>
            <p className="text-xs text-gray-500">Desteklenen model</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-extrabold text-cyan-600">100%</p>
            <p className="text-xs text-gray-500">Modeline uyumlu urun</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-extrabold text-cyan-600">7/24</p>
            <p className="text-xs text-gray-500">Destek</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;

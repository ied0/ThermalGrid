// Sahte odeme ekrani. Kart bilgisi alir ama HICBIR yere gondermez,
// gercek tahsilat yoktur. "Ode" deyince siparisi olusturup sepeti temizler.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { siparisOlustur } from "../api";

function PaymentPage() {
  const { sepet, temizle, toplamTutar } = useCart();
  const navigate = useNavigate();

  const [kart, setKart] = useState({ ad: "", no: "", tarih: "", cvv: "" });
  const [hata, setHata] = useState(null);
  const [odeniyor, setOdeniyor] = useState(false);

  // Kart numarasini 4'erli grupla (sadece gorsel)
  function noDegis(e) {
    const sadeceRakam = e.target.value.replace(/\D/g, "").slice(0, 16);
    const gruplu = sadeceRakam.replace(/(.{4})/g, "$1 ").trim();
    setKart({ ...kart, no: gruplu });
  }

  // Sepet bossa odeme yapilmaz
  if (sepet.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Sepetin bos.</p>
        <Link to="/" className="text-cyan-600 font-medium">Alisverise basla</Link>
      </div>
    );
  }

  async function ode(e) {
    e.preventDefault();
    setHata(null);

    // Basit kontrol (sahte ama format dogru olsun)
    const no = kart.no.replace(/\s/g, "");
    if (no.length !== 16) return setHata("Kart numarasi 16 haneli olmali");
    if (kart.cvv.length !== 3) return setHata("CVV 3 haneli olmali");
    if (!kart.tarih) return setHata("Son kullanma tarihini gir");

    setOdeniyor(true);
    try {
      // Gercek siparisi burada olusturuyoruz (kart bilgisi gonderilmiyor)
      const kalemler = sepet.map((u) => ({ urun_id: u.id, adet: u.adet }));
      await siparisOlustur(kalemler);
      temizle();
      navigate("/hesabim");
    } catch (err) {
      setHata(err.message);
      setOdeniyor(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Odeme</h2>
        <p className="text-gray-500 text-sm mb-4">Odenecek tutar: <span className="font-bold text-slate-800">{toplamTutar} TL</span></p>

        {/* Bu bir demo, gercek odeme yok uyarisi */}
        <p className="text-xs bg-amber-50 text-amber-700 rounded p-2 mb-4">
          Bu bir demo odeme ekranidir, gercek tahsilat yapilmaz.
        </p>

        {hata && <p className="text-red-600 bg-red-50 rounded p-2 text-sm mb-4">{hata}</p>}

        <form onSubmit={ode} className="space-y-3">
          <input value={kart.ad} onChange={(e) => setKart({ ...kart, ad: e.target.value })} required
            placeholder="Kart uzerindeki isim"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <input value={kart.no} onChange={noDegis} required
            placeholder="1234 5678 9012 3456"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <div className="flex gap-3">
            <input value={kart.tarih} onChange={(e) => setKart({ ...kart, tarih: e.target.value })} required
              placeholder="AA/YY" maxLength="5"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <input value={kart.cvv} onChange={(e) => setKart({ ...kart, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} required
              placeholder="CVV"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          </div>

          <button disabled={odeniyor}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {odeniyor ? "Odeme aliniyor..." : `${toplamTutar} TL Ode`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentPage;

// Musterinin kendi siparislerini ve durumlarini gosteren sayfa.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBenimSiparisler } from "../api";

// Durumu renkli etiket olarak gosteren kucuk yardimci
export function durumEtiketi(durum) {
  if (durum === "hazirlaniyor") return { yazi: "Hazirlaniyor", renk: "bg-amber-100 text-amber-700" };
  if (durum === "kargoda")      return { yazi: "Kargoda", renk: "bg-blue-100 text-blue-700" };
  if (durum === "teslim")       return { yazi: "Teslim Edildi", renk: "bg-green-100 text-green-700" };
  return { yazi: durum, renk: "bg-gray-100 text-gray-700" };
}

function OrdersPage() {
  const { user } = useAuth();
  const [siparisler, setSiparisler] = useState([]);

  useEffect(() => {
    if (user) getBenimSiparisler().then(setSiparisler).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Siparislerini gormek icin <Link to="/login" className="text-cyan-600 font-medium">giris yap</Link>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Siparislerim</h2>

      {siparisler.length === 0 ? (
        <p className="text-gray-500">Henuz siparisin yok.</p>
      ) : (
        <div className="space-y-4">
          {siparisler.map((s) => {
            const e = durumEtiketi(s.durum);
            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Siparis #{s.id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${e.renk}`}>{e.yazi}</span>
                </div>
                {/* Kalemler */}
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {s.kalemler.map((k, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{k.ad} × {k.adet}</span>
                      <span>{k.fiyat * k.adet} TL</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t mt-2 pt-2 font-bold text-slate-800">
                  <span>Toplam</span>
                  <span>{s.toplam} TL</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;

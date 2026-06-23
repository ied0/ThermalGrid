// Sepet yonetimi. Sepetteki urunleri burada tutuyoruz, localStorage'a da
// yaziyoruz ki sayfa yenilenince sepet bosalmasin.
// Her urun icin { ...urun, adet } seklinde saklıyoruz.
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Baslangicta localStorage'da kayitli sepet varsa onu yukle
  const [sepet, setSepet] = useState(() => {
    const kayitli = localStorage.getItem("sepet");
    return kayitli ? JSON.parse(kayitli) : [];
  });

  // Sepet her degistiginde localStorage'i guncelle
  useEffect(() => {
    localStorage.setItem("sepet", JSON.stringify(sepet));
  }, [sepet]);

  // Urun ekle. Zaten sepetteyse adedini 1 artir.
  function ekle(urun) {
    setSepet((onceki) => {
      const mevcut = onceki.find((x) => x.id === urun.id);
      if (mevcut) {
        return onceki.map((x) =>
          x.id === urun.id ? { ...x, adet: x.adet + 1 } : x
        );
      }
      return [...onceki, { ...urun, adet: 1 }];
    });
  }

  // Urunu sepetten tamamen cikar
  function cikar(urunId) {
    setSepet((onceki) => onceki.filter((x) => x.id !== urunId));
  }

  function temizle() {
    setSepet([]);
  }

  // Toplam tutar ve toplam adet (header'daki rozet icin)
  const toplamTutar = sepet.reduce((t, x) => t + x.fiyat * x.adet, 0);
  const toplamAdet = sepet.reduce((t, x) => t + x.adet, 0);

  return (
    <CartContext.Provider value={{ sepet, ekle, cikar, temizle, toplamTutar, toplamAdet }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

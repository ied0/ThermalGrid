// Oturum (giris) yonetimi. Tum uygulamada "kim giris yapmis" bilgisini
// buradan okuyoruz. Token'i localStorage'da tutuyoruz ki sayfa yenilenince
// kullanici cikis yapmis olmasin.
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Uygulama acilinca: localStorage'da token varsa kullaniciyi geri yukle
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe(token)
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem("token")) // token bozuksa sil
        .finally(() => setYukleniyor(false));
    } else {
      setYukleniyor(false);
    }
  }, []);

  // Giris yap: token'i kaydet, kullaniciyi state'e koy
  async function login(email, sifre) {
    const veri = await loginUser(email, sifre);
    localStorage.setItem("token", veri.access_token);
    setUser(veri.user);
  }

  // Kayit ol, sonra otomatik giris yap (kullaniciyi ugrastirmayalim)
  async function register(bilgi) {
    await registerUser(bilgi);
    await login(bilgi.email, bilgi.sifre);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // Profil guncellenince header'daki isim vs. yenilensin diye
  function kullaniciGuncelle(yeniUser) {
    setUser(yeniUser);
  }

  return (
    <AuthContext.Provider value={{ user, yukleniyor, login, register, logout, kullaniciGuncelle }}>
      {children}
    </AuthContext.Provider>
  );
}

// Kisayol: bilesenlerde const { user, login } = useAuth() seklinde kullanacagiz
export function useAuth() {
  return useContext(AuthContext);
}

// Uygulamanin ana iskeleti: ust menu (header) + sayfa yonlendirmeleri + footer.
// Header artik oturuma gore degisiyor: giris yapmamissa "Giris/Kayit",
// yapmissa "Merhaba X + Cikis" gosteriyor. Sepet rozetinde adet sayisi var.
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

import HomePage from "./pages/HomePage.jsx";
import CihazDetay from "./pages/CihazDetay.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import SellerPage from "./pages/SellerPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  const { user, logout } = useAuth();
  const { toplamAdet } = useCart();
  const navigate = useNavigate();

  function cikisYap() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ----- UST MENU (header) ----- */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">❄️</span>
            <div className="leading-tight">
              <span className="text-xl font-extrabold text-slate-800">
                Thermal<span className="text-cyan-500">Grid</span>
              </span>
              <p className="text-[11px] text-gray-400 -mt-1">Laptop Sogutma Cozumleri</p>
            </div>
          </Link>

          {/* Menu linkleri */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-cyan-500">Anasayfa</Link>
            <Link to="/hakkimizda" className="hover:text-cyan-500">Hakkimizda</Link>
            {/* Giris yapmissa hesabina (bilgi + siparisler) ulasabilsin */}
            {user && <Link to="/hesabim" className="hover:text-cyan-500">Hesabim</Link>}
            {/* Satici (veya admin) ise kendi panelinin linki */}
            {(user?.rol === "satici" || user?.rol === "admin") && (
              <Link to="/satici" className="hover:text-cyan-500">Urunlerim</Link>
            )}
            {user?.rol === "admin" && <Link to="/admin" className="hover:text-cyan-500">Yonetim</Link>}
          </nav>

          {/* Sag taraf: sepet + giris durumu */}
          <div className="flex items-center gap-3">
            {/* Sepet butonu - rozette adet */}
            <Link to="/sepet" className="relative flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-700">
              🛒 <span className="hidden sm:inline">Sepet</span>
              {toplamAdet > 0 && (
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center">
                  {toplamAdet}
                </span>
              )}
            </Link>

            {/* Giris yapmamissa: Giris linki. Yapmissa: isim + cikis */}
            {user ? (
              <div className="flex items-center gap-2 text-sm">
                <Link to="/hesabim" className="hidden sm:inline text-slate-600 hover:text-cyan-600">
                  Merhaba, <span className="font-semibold">{user.ad}</span>
                </Link>
                <button onClick={cikisYap} className="text-red-500 hover:text-red-600 font-medium">
                  Cikis
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
                Giris / Kayit
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ----- SAYFA ICERIGI ----- */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cihaz/:id" element={<CihazDetay />} />
          <Route path="/sepet" element={<CartPage />} />
          <Route path="/hakkimizda" element={<AboutPage />} />
          <Route path="/satici" element={<SellerPage />} />
          <Route path="/urun/:id" element={<ProductPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/siparislerim" element={<OrdersPage />} />
          <Route path="/hesabim" element={<ProfilePage />} />
          <Route path="/odeme" element={<PaymentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      {/* ----- FOOTER ----- */}
      <footer className="bg-slate-800 text-slate-300 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm">
          <p className="font-semibold text-white">ThermalGrid ❄️</p>
          <p className="mt-1">Laptopunu serin tut. © 2026 ThermalGrid</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

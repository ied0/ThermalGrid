-- =====================================================================
-- ThermalGrid - Veritabanı Şeması
-- Proje 2 dersi / Çoka-Çok ilişki demosu
--
-- Mantık: Laptoplar ile soğutma ürünleri arasında çoka-çok ilişki var.
-- Bir laptop birden çok ürüne uyar, bir ürün birden çok laptopa uyar.
-- O yüzden ortada "cihaz_urun" diye bir ara tablo (junction) kullanıyoruz.
-- =====================================================================

-- Önce varsa eski tabloları silelim ki baştan temiz kuralım.
-- (Sıra önemli: önce ara tablo, sonra ana tablolar - foreign key yüzünden)
DROP TABLE IF EXISTS cihaz_urun;
DROP TABLE IF EXISTS cihazlar;
DROP TABLE IF EXISTS urunler;
DROP TABLE IF EXISTS users;


-- ---------------------------------------------------------------------
-- 0) USERS tablosu = kullanicilar (musteri / satici / admin)
-- Sifreyi DUZ METIN tutmuyoruz, bcrypt hash'ini tutuyoruz (sifre_hash).
-- rol alani 3 degerden biri olabilir: musteri, satici, admin
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    ad         VARCHAR(100) NOT NULL,
    email      VARCHAR(120) NOT NULL UNIQUE,     -- email tekil olmali, ayni mail iki kez kayit olamaz
    sifre_hash VARCHAR(200) NOT NULL,
    rol        VARCHAR(20)  NOT NULL DEFAULT 'musteri',
    adres      VARCHAR(300)
);


-- ---------------------------------------------------------------------
-- 1) CIHAZLAR tablosu = laptop modelleri
-- ---------------------------------------------------------------------
CREATE TABLE cihazlar (
    id          SERIAL PRIMARY KEY,          -- otomatik artan id
    marka       VARCHAR(50)  NOT NULL,       -- örn: MSI, Asus
    model       VARCHAR(100) NOT NULL,       -- örn: GF65 Thin
    islemci     VARCHAR(100),                -- örn: Intel i7-10750H (undervolt önerisi için lazım olacak)
    isi_sorunu  VARCHAR(200)                 -- bu laptopun bilinen ısınma derdi (kısa not)
);


-- ---------------------------------------------------------------------
-- 2) URUNLER tablosu = soğutma ürünleri / rehberler
-- ---------------------------------------------------------------------
CREATE TABLE urunler (
    id        SERIAL PRIMARY KEY,
    ad        VARCHAR(100)  NOT NULL,        -- örn: Arctic MX-4 Termal Macun
    kategori  VARCHAR(50),                   -- termal_macun / sogutucu_ped / rehber
    fiyat     NUMERIC(8,2),                  -- TL fiyatı (rehberler 0 olabilir)
    aciklama  TEXT,                          -- ürünün kısa açıklaması
    foto_url  VARCHAR(300),                  -- yüklenen görselin yolu (yoksa NULL)
    satici_id INTEGER REFERENCES users(id)   -- ürünü ekleyen satıcı (seed ürünlerde NULL)
);


-- ---------------------------------------------------------------------
-- 3) CIHAZ_URUN = ARA TABLO (junction)
-- İşte çoka-çok ilişkiyi kuran tablo burası.
-- İki tane foreign key var, ikisi birlikte primary key oluyor
-- (aynı laptop-ürün eşleşmesi iki kez girilmesin diye).
-- ---------------------------------------------------------------------
CREATE TABLE cihaz_urun (
    cihaz_id  INTEGER NOT NULL REFERENCES cihazlar(id) ON DELETE CASCADE,
    urun_id   INTEGER NOT NULL REFERENCES urunler(id)  ON DELETE CASCADE,
    PRIMARY KEY (cihaz_id, urun_id)
);


-- ---------------------------------------------------------------------
-- 4) YORUMLAR tablosu = kullanicilarin urunlere yaptigi yorum + puan
-- Bir urunun cok yorumu olur (bire-cok iliski).
-- ---------------------------------------------------------------------
CREATE TABLE yorumlar (
    id      SERIAL PRIMARY KEY,
    urun_id INTEGER NOT NULL REFERENCES urunler(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    puan    INTEGER NOT NULL,           -- 1-5 arasi yildiz
    metin   TEXT,
    tarih   TIMESTAMP DEFAULT now()
);


-- ---------------------------------------------------------------------
-- 5) SIPARISLER + SIPARIS_KALEM = siparis ve icindeki urunler
-- Bir siparisin birden cok kalemi olur (bire-cok). Odeme yok, sadece kayit.
-- durum: hazirlaniyor / kargoda / teslim
-- ---------------------------------------------------------------------
CREATE TABLE siparisler (
    id      SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    tarih   TIMESTAMP DEFAULT now(),
    durum   VARCHAR(20) NOT NULL DEFAULT 'hazirlaniyor',
    toplam  NUMERIC(10,2)
);

CREATE TABLE siparis_kalem (
    id         SERIAL PRIMARY KEY,
    siparis_id INTEGER NOT NULL REFERENCES siparisler(id) ON DELETE CASCADE,
    urun_id    INTEGER REFERENCES urunler(id),
    ad         VARCHAR(100),              -- urun adini o anki haliyle kaydediyoruz
    fiyat      NUMERIC(8,2),              -- o anki fiyat (sonra degisirse siparis etkilenmesin)
    adet       INTEGER NOT NULL
);

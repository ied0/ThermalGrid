-- =====================================================================
-- ThermalGrid - Demo Veriler (seed)
--
-- Buradaki amaç çok fazla veri girmek değil; çoka-çok ilişkiyi
-- gösterecek kadar mantıklı birkaç laptop ve ürün koymak.
-- Dikkat: aynı ürün birden çok laptopta, aynı laptop birden çok üründe
-- geçiyor -> işte çoka-çok ilişki tam da bu.
--
-- Not: schema.sql'i çalıştırdıktan SONRA bunu çalıştır.
-- =====================================================================

-- ---------------------------------------------------------------------
-- LAPTOPLAR
-- ID'leri biz yazmıyoruz, SERIAL otomatik veriyor (1, 2, 3, 4 gidecek)
-- ---------------------------------------------------------------------
INSERT INTO cihazlar (marka, model, islemci, isi_sorunu) VALUES
('MSI',    'GF65 Thin',     'Intel i7-10750H', 'Oyunda CPU 90C+ goruyor, throttle yapiyor'),
('Asus',   'TUF Gaming F15', 'Intel i5-11400H', 'Fan sesi yuksek ama yine de isiniyor'),
('Lenovo', 'Legion 5',      'Ryzen 7 5800H',   'Genelde iyi ama uzun oyunda klavye isiniyor'),
('HP',     'Victus 16',     'Ryzen 5 5600H',   'Hava akisi zayif, macun degisimi sart');


-- ---------------------------------------------------------------------
-- URUNLER
-- kategori alanini sabit birkac degerle kullaniyoruz:
-- termal_macun / sogutucu_ped / rehber
-- Rehberlerin fiyati 0 (ucretsiz icerik gibi dusun)
-- ---------------------------------------------------------------------
INSERT INTO urunler (ad, kategori, fiyat, aciklama) VALUES
('Arctic MX-4 Termal Macun',     'termal_macun',  250.00, 'Klasik, guvenilir termal macun. CPU sicakligini ortalama 5-8C dusurur.'),
('Thermal Grizzly Kryonaut',     'termal_macun',  450.00, 'Daha pahali ama performansi yuksek macun. Overclock yapanlar tercih eder.'),
('Cooler Master Notepal Ped',    'sogutucu_ped',  600.00, '5 fanli sogutucu ped. Laptopu yukseltip alttan hava verir.'),
('Undervolting Rehberi (PDF)',   'rehber',          0.00, 'ThrottleStop ile CPU voltaj dusurme adim adim anlatim. Tamamen ucretsiz.');


-- ---------------------------------------------------------------------
-- ARA TABLO: hangi urun hangi laptopa uyuyor?
-- Burayi elle ID vererek dolduruyoruz cunku eslestirmeyi biz belirliyoruz.
-- (laptop id'leri 1-4, urun id'leri 1-4 olarak gidiyor yukaridaki sirayla)
--
-- Eslestirme mantigi:
--   MSI GF65 (1)        -> MX-4 (1), Kryonaut (2), Ped (3), Undervolt rehberi (4)  [her seye uyuyor]
--   Asus TUF (2)        -> MX-4 (1), Ped (3), Undervolt rehberi (4)
--   Lenovo Legion 5 (3) -> Kryonaut (2), Undervolt rehberi (4)
--   HP Victus 16 (4)    -> MX-4 (1), Ped (3)
--
-- Gorulen sey: MX-4 (urun 1) birden fazla laptopta var,
-- MSI GF65 (cihaz 1) birden fazla urune sahip -> coka-cok.
-- ---------------------------------------------------------------------
INSERT INTO cihaz_urun (cihaz_id, urun_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 4),
(3, 2), (3, 4),
(4, 1), (4, 3);

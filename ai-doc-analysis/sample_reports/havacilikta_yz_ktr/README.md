# TEKNOFEST Havacılıkta Yapay Zeka — KTR (Kritik Tasarım Raporu) Paketi

Hazırlayan: Perplexity Computer | Tarih: 2026-08-23

## İçerik

- `reports/` — 34 adet KTR (Kritik Tasarım Raporu) PDF dosyası (2022 sezonu, farklı takımlar)
- `sartname_genel_2026.pdf` — 2026 Havacılıkta YZ Genel Şartnamesi
- `sartname_teknik_2026.pdf` — 2026 Havacılıkta YZ Teknik Şartnamesi
- `sablon_OTR_2026.docx` — 2026 ÖTR (Ön Tasarım Raporu) Şablonu (resmi, sitede yayında)
- `KTR_Dosya_Listesi.csv` — İndirilen dosyaların listesi (dosya adı + takım + yıl + tür + boyut)
- `KTR_Dogrulama.csv` — Bölüm yapısı doğrulama tablosu (34 rapor × 6 bölüm)
- `Puan_Rubrigi.md` — Bölüm puan ağırlıkları listesi
- `README.md` — bu dosya

## (a) Dosya Listesi Özeti

- **Toplam rapor:** 34 (hedef ~34'ün tamamı)
- **Sezon:** 2022 (32'si PDF CreationDate ile teyit edildi; 2'sinde tarih meta verisi yok ama içerikten 2022)
- **Rapor türü:** 34/34 Kritik Tasarım Raporu (KTR)
- **Takım adı çıkarılan:** 24/34 (10 raporda takım adı yalnızca kapak logosunda/görselinde, metin olarak çıkarılamadı)
- **Toplam boyut:** ~81 MB

## (b) Bölüm Yapısı Doğrulama Tablosu (34 rapor)

| # | Bölüm | Birebir | Farklı İsim | Yok |
|---|-------|--------|------------|-----|
| 1 | Takım Şeması | 34 | 0 | 0 |
| 2 | Proje Mevcut Durum Değerlendirmesi | 34 | 0 | 0 |
| 3 | Algoritmalar ve Sistem Mimarisi | 33 | 1 | 0 |
| 4 | Özgünlük | 34 | 0 | 0 |
| 5 | Sonuçlar ve İnceleme | 34 | 0 | 0 |
| 6 | Kaynakça | 30 | 3 | 1 |

**Sonuç:** 6 bölüm yapısı 34 raporun tamamında tutarlı. Birebir uyum oranı %98+.

- **Farklı isim varyantları:**
  - Bölüm 3: 1 rapor "Veri Setleri ve Algoritmalar" (kanonik: "Algoritmalar ve Sistem Mimarisi")
  - Bölüm 6: 3 rapor "Referanslar" / "Kaynaklar" (kanonik: "Kaynakça")
- **Eksik:** 1 raporda "Kaynakça" bölümü bulunamadı.
- **7. bölüm:** Tutarlı bir 7. bölüm YOK. "Ekler" sözcüğü bazı raporların gövde metninde geçse de numaralı, yapılandırılmış bir 7. bölüm başlığı olarak görünmüyor. Yalnızca 1 raporda (WENN) "Sonuç olarak..." başlıklı ek bir numaralı bölüm var (8.).

## (c) Şartname Kaynağı

- KTR raporları **2022 sezonuna** ait (PDF meta verisi + sayfa içeriğiyle teyit).
- 2022 sezonunun Havacılıkta YZ şartnamesi TEKNOFEST sitesinde **artık yayında değil** (eski sezon sayfaları kaldırılmış).
- Bu nedenle **en yakın güncel sezonun şartnamesi** indirildi: **2026 sezonu**.
  - `sartname_genel_2026.pdf` — 2026 Genel Şartname
  - `sartname_teknik_2026.pdf` — 2026 Teknik Şartname
- Kaynak: https://www.teknofest.org/tr/yarismalar/havacilikta-yapay-zeka-yarismasi/ (Yarışma Şartnamesi sekmesi)
- **DÜZELTME (Claude Code, 2026-08-23 - dosyayı bizzat açıp kontrol ederek):**
  Perplexity'nin yukarıdaki notu **yanlış** — 2026 teknik şartnamesinde
  "Kritik Tasarım Raporu (KTR)" terimi **hiç geçmiyor**. 2026'da bu aşama
  **"Final Tasarım Raporu (FTR)"** olarak adlandırılıyor (bkz.
  `sartname_teknik_2026.pdf` madde 5.2). Yani:
  - 2026 şartnamesi bizim 2022 KTR verimiz için **doğrulanmış bir referans
    değil** — sadece "elde hiç şartname olmasın diye indirilen en yakın
    doküman". İçeriğinin 2022 KTR yapısıyla örtüştüğü **kontrol edilmedi**.
  - `zorunlu_basliklar` listemiz **tamamen 2022 raporlarının kendisinden**
    geliyor, şartnameden değil — bu yüzden bu düzeltme `mvp-rules.json`'ı
    geçersiz kılmıyor, sadece "2026 şartnamesi referans olarak kullanılabilir"
    iddiasını geçersiz kılıyor.
  - Aynı isim/yapı değişimi Sağlıkta YZ'de de görülmüştü (bkz. proje
    geçmişi) — TEKNOFEST'in yıldan yıla rapor terminolojisini/yapısını
    değiştirmesi görünüşe göre genel bir örüntü.

## (d) Resmi KTR Şablonu Durumu

- TEKNOFEST sitesinde **yalnızca ÖTR (Ön Tasarım Raporu) şablonu** yayında (2026): `sablon_OTR_2026.docx`.
- **KTR şablonu sitede yayında DEĞİL.** (2026 sezonu erken aşamada olduğu için yalnızca ilk aşama şablonu — ÖTR — yayınlanmış; KTR/FTR şablonları henüz paylaşılmamış.)
- 2022 KTR şablonu da arşivde/offline.
- **Sonuç:** Resmi KTR şablonu artık yayında değil; KTR bölüm yapısı bu paketteki 34 rapordan çıkarıldı (şablonu yeniden oluşturma işlemi bu paketin kapsamı dışında — başlık listesi raporlardan çıkarıldı).

## Notlar

- Hedef dizin (kullanıcı): `ai-doc-analysis/sample_reports/gelen/` — `reports/` içindeki 34 PDF bu dizine yüklenebilir.
- Otomatik puanlama/skorlama kodu bu pakette YOK (kullanıcının notu: değerlendirme modülü ayrı bir ekip arkadaşının işi).

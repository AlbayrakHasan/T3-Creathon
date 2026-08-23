# Perplexity Araştırma + İndirme Prompt'u — v3

> Amaç: Sağlıkta Yapay Zeka Yarışması'nı referans kategori seçtik (bkz.
> `docs/perplexity-arastirma-prompt-v2.md` sonucu). Elimizde şu an sadece 2
> gerçek finalist raporu var (ZEBOT-E1, C-KÜP — "Bilgisayarlı Görüyle Abdomen
> Bölgesi için Hastalık Tespiti" alt kategorisi). Bu prompt, aynı sezona ait
> **eşleşen şartname+şablon** ile **daha fazla çeşitli örnek rapor** bulup
> indirmesi için Perplexity'ye veriliyor.
>
> İndirilen dosyaları şuraya yükle:
> `ai-doc-analysis/sample_reports/gelen/` (bu klasörü zaten oluşturdum).
> Dosya adı önemli değil, ben inceleyip düzenli isimlere taşıyacağım.

---

```
TEKNOFEST Sağlıkta Yapay Zeka Yarışması için gerçek geçmiş yıl rapor
şablonlarını, şartnamelerini ve örnek/finalist raporlarını bulup indirmeme
yardım et.

BAĞLAM: Elimde bu yarışmanın "Bilgisayarlı Görüyle Abdomen (Karın) Bölgesi
için Hastalık Tespiti Kategorisi" alt kategorisinden iki gerçek Proje Detay
Raporu (PDR) var: takım adları "ZEBOT-E1" (Takım ID: 410880) ve "C-KÜP (C3)"
(Takım ID: 329369). Bu raporların başlık yapısı şöyle: "1. Proje Mevcut Durum
Değerlendirmesi", "2. Özgünlük", "3. Sonuçlar ve İnceleme", "4. Deney ve
Eğitim Aşamalarında Kullanılan Veri Setleri", "5. Referanslar". Bu, TEKNOFEST'in
GÜNCEL (2026) şablonundan farklı - yani bu raporlar eski bir sezona ait
(muhtemelen 2022, 2023 veya 2024).

ADIM 1 - Hangi sezona ait olduğunu bul:
"ZEBOT-E1 TEKNOFEST Sağlıkta Yapay Zeka" ve "C-KÜP TEKNOFEST Sağlıkta Yapay
Zeka" gibi aramalarla bu takımların hangi yıl yarıştığını tespit et (haber,
duyuru, sonuç sayfası vb. üzerinden). Bulduğun yılı net şekilde belirt.

ADIM 2 - O sezonun şartname ve şablonunu bul:
teknofest.org/tr/season/<bulunan-yil> üzerinden Sağlıkta Yapay Zeka
Yarışması sayfasına git. "Yarışma Şartnamesi" ve "Rapor Şablonları"
sekmelerindeki dosyaları bul. Özellikle "Bilgisayarlı Görüyle Hastalık
Tespiti" alt kategorisine ait Proje Detay Raporu (PDR) şablonunu indir
(dosya formatı DOCX/DOC olmalı). Şartname PDF'ini de indir.

ADIM 3 - Çeşitli örnek raporlar indir:
Aynı sezonun "Derece Listesi" / "Geçmiş Yıl Raporları" sekmesinden, aynı alt
kategoriden (Bilgisayarlı Görüyle Hastalık Tespiti) EK 3-4 rapor daha indir.
Çeşitlilik için şunlara dikkat et:
- Hem Lise hem Üniversite seviyesinden en az birer tane
- Hem "Derece Durumu" (dereceye giren) hem "Başarılı/Finalist Durumu"
  etiketli en az birer tane
- Mümkünse farklı takımlar (aynı takımı iki kez indirme)

ADIM 4 (opsiyonel, zaman kalırsa) - Diğer alt kategoriler:
Aynı sezondan "Biyoinformatik Analiz" ve "Medikal Teknolojiler" alt
kategorilerinden birer örnek şablon + birer örnek rapor daha indir (farklı
başlık yapılarını görüp karşılaştırmak için).

Tüm indirilen dosyaları bana ver / bir klasörde topla. Her dosya için: hangi
yıla, hangi seviyeye (Lise/Üniversite), hangi alt kategoriye ait olduğunu ve
kaynağının URL'sini belirt.
```

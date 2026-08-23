# Perplexity Araştırma Prompt'u — v2 (güncellenmiş)

> Neden güncellendi: teknofest.org'da her yarışmanın kendi sayfasında
> `Yarışma Şartnamesi`, `Rapor Şablonları`, `Yarışma Dokümanları` ve
> `Geçmiş Yıl Raporları` diye ayrı sekmeler olduğunu gördük (ekran görüntüsüyle
> doğrulandı). Ayrıca sayfalar yıl bazlı değişiyor
> (`teknofest.org/tr/season/2025` gibi) — 2026 sezonunda bazı yarışmaların
> rapor şablonu henüz yayınlanmamış olabiliyor (örn. Savaşan İHA 2026'da
> "ilerleyen tarihte duyurulacak" yazıyor). Bu prompt bunu hesaba katıyor.

---

```
TEKNOFEST yarışmaları için rapor şartname/şablon ve geçmiş yıl örnek
raporlarını bulmama yardım et.

BAĞLAM: teknofest.org sitesinde her yarışmanın kendi sayfası var
(ör. teknofest.org/tr/yarismalar/<yarisma-adi>/), ve bu sayfada şu sekmeler
bulunuyor: "Yarışma Şartnamesi", "Rapor Şablonları", "Yarışma Dokümanları",
"Geçmiş Yıl Raporları". Sayfa ayrıca yıl bazlı arşivleniyor
(teknofest.org/tr/season/2025, /2024, /2023 gibi) - bir yarışmanın güncel
yılında (2026) rapor şablonu henüz yayınlanmamış olabilir, bu yüzden en
yakın geçmiş yılı (2025 veya 2024) da kontrol etmen gerekebilir.

ADIM 1 - Yapay zeka / yazılım / veri odaklı kategorileri listele:
TEKNOFEST'in yapay zeka, yazılım, veri analitiği, doğal dil işleme, eğitim
teknolojileri, siber güvenlik gibi alanlara yakın yarışma kategorilerinin
güncel listesini çıkar (2025 ve 2024 sezonları için).

ADIM 2 - Hangi kategoride en fazla malzeme var:
Yukarıdaki kategorilerden HANGİLERİNİN "Rapor Şablonları" sekmesinde
gerçekten indirilebilir bir şablon dosyası VE "Geçmiş Yıl Raporları"
sekmesinde en az birkaç adet gerçek/finalist rapor bulunduğunu tespit et.
Sonucu şu şekilde sırala: en çok örnek + şablon bulunan kategoriden en aza
doğru. Az örnek/şablonu olan veya hiç olmayan kategorileri de belirt (elenmiş
olarak).

ADIM 3 - En iyi 2-3 aday için detay:
En çok malzemesi olan ilk 2-3 kategori için ayrı ayrı şunu ver:
- Kategori adı ve hangi yıla ait sayfa (2025/2024/...)
- Rapor Şablonları sekmesindeki dosyanın tam adı (ör. "Kritik Tasarım Raporu
  Şablonu") ve varsa doğrudan indirme linki
- Geçmiş Yıl Raporları sekmesinde kaç adet örnek rapor olduğu, dosya adları
  ve varsa linkleri
- Bu kategorinin zorunlu rapor bölüm başlıkları (şablon dosyasından
  çıkarabiliyorsan)

ADIM 4 - Puanlama/değerlendirme kriterleri:
Seçilen en iyi 1-2 kategori için jüri değerlendirme kriterlerini/rubriklerini
ve ağırlıklarını bul.

Sonuçları tablo halinde sun. Her bilgi için kaynak URL'sini ve hangi yıla ait
olduğunu belirt.

Not: Bu bilgileri "T3 Vakfı Yapay Zeka Creathonu" adlı bir hackathon
projesinde, rapor değerlendirme sistemi için gerçekçi test verisi (şablon +
örnek raporlar) toplamak amacıyla kullanacağım.
```

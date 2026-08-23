# API Sözleşmesi (Taslak)

> Bu doküman Hasan (ai-doc-analysis), Hayrettin (ai-scoring) ve Mustafa (backend)
> arasında paylaşılacak sözleşmedir. Mustafa ve Hayrettin ile henüz resmi olarak
> onaylanmadı — taslak olarak buraya konuldu ki entegrasyon (FAZ 4) sırasında
> herkes aynı formatı bilsin.

## 1. Doküman & Şablon Analizi (Hasan — `ai-doc-analysis`)

**Giriş noktası:** `analyze_document(pdf_path: str, rules: dict) -> dict`
(bkz. `ai-doc-analysis/analyzer.py`)

**Backend'in beklediği çağrı şekli (öneri):** `POST /analyze-template` — dosya
yüklenince backend bu fonksiyonu (ya da onu saran bir HTTP endpoint'i) çağırır.

**Çıktı JSON şeması:**
```json
{
  "dil": "tr",
  "dil_uygun": true,
  "sayfa_sayisi": 12,
  "sayfa_uygun": true,
  "sablon_uygun": true,
  "eksik_basliklar": ["Sonuç"],
  "icerik_yetersiz_basliklar": [],
  "hatalar": []
}
```

| Alan | Tip | Açıklama |
|---|---|---|
| `dil` | string | ISO 639-1 dil kodu (`tr`, `en`, ...) ya da `unknown` |
| `dil_uygun` | boolean | Tespit edilen dil `kabul_edilen_diller` listesinde mi |
| `sayfa_sayisi` | int | PDF'in toplam sayfa sayısı |
| `sayfa_uygun` | boolean | Sayfa sayısı `min_sayfa`-`max_sayfa` aralığında mı |
| `sablon_uygun` | boolean | Tüm zorunlu başlıklar bulunduysa `true` |
| `eksik_basliklar` | string[] | Bulunamayan zorunlu başlıkların listesi |
| `icerik_yetersiz_basliklar` | string[] | **Bulunan** ama altında çok az metin olan başlıklar (bkz. sınırlama notu aşağıda) |
| `hatalar` | string[] | Analiz sırasında oluşan hata mesajları (normal akışta boş) |

**`icerik_yetersiz_basliklar` hakkında önemli sınırlama:** Bu sadece "başlığın
altında neredeyse hiç metin yok mu" diye bakan kaba bir kontrol — içeriğin
*kalitesini* değerlendirmiyor (o, Hayrettin'in AI kriter modülünün işi). Kalın
başlıklar arası mesafeyi ölçerek çalışıyor, `docs/mvp-rules.json`'daki
`min_bolum_karakter` (varsayılan eşik) ve `min_bolum_karakter_override`
(bölüme özel istisna — örn. "Takım Şeması" doğal olarak kısa olduğu için 0)
ile ayarlanabiliyor.

**Eşanlamlı başlıklar (`esanlamli_basliklar`):** 34 gerçek finalist raporunu
test ederken gördük ki gerçek hakemler "Kaynakça" yerine "Referanslar"/
"Kaynaklar" yazan raporları da kabul etmiş — birebir kelime eşleşmesi bu
raporları haksız yere "eksik" sayıyordu. `mvp-rules.json`'da her kanonik
başlık için bilinen varyantlar tanımlanabiliyor:
```json
"esanlamli_basliklar": {
  "Kaynakça": ["Referanslar", "Kaynaklar"],
  "Algoritmalar ve Sistem Mimarisi": ["Veri Setleri ve Algoritmalar"]
}
```
Bu ekleme sonrası 34 raporun 32'si `sablon_uygun: true` çıkıyor (öncesinde
28'di) — gerçek hakem kararına çok daha yakın bir sonuç.

**Hata durumu (PDF okunamadıysa):**
```json
{ "hata": "PDF'ten metin çıkarılamadı (taranmış/görüntü PDF olabilir)" }
```
Bu durumda backend, raporu "işlenemedi" durumuna almalı ve hakeme/yarışmacıya
bunu bildirmeli — sistem çökmemeli.

### ✅ Gerçek backend ile uyumsuzluk keşfedildi ve entegre edildi (2026-08-23)

Takımın ayrı ilerlettiği (https://github.com/mahmutconger/t3creathon_web)
backend
(`backend/app/services/ai.py`) ve veritabanı şeması (`AiAnalysis` tablosu:
`language_template_score` INTEGER kolonu) ve hakem paneli (frontend,
`src/lib/ai-analysis.ts`) benimle hiç senkron olunmadan **farklı bir format**
üzerine kurulmuş:

```json
{
  "languageTemplate": { "score": 92, "summary": "...", "findings": ["..."] },
  "contentHeading": { "score": 88, "summary": "...", "findings": ["..."] }
}
```

Bu, yukarıdaki boolean/liste tabanlı şemadan tamamen farklı — 0-100 puan +
insan-okur özet/bulgu bekliyor. Değiştirmek yerine (DB şeması + hakem paneli
zaten bu formata göre inşa edilmiş, geri almak daha maliyetli) bir **adaptör
fonksiyon** yazıldı: `analyze_document_for_ui(pdf_path, rules=None) -> dict`
(bkz. `ai-doc-analysis/analyzer.py`). Bunu çağırıp yukarıdaki iki alanı
üretiyor, backend'deki mock `analyze_document(file_path)`'in yerine
doğrudan geçebilir.

Puan bantları `src/lib/ai-analysis.ts`'teki eşiklerle hizalandı: ≥85 "yüksek
güven", 65-84 "gözden geçirilmeli", <65 "kritik". 34 gerçek raporla test
edildi: 32'si her iki alanda da 100 puan, 1'i (gerçekten eksik başlık) 80
puanla "gözden geçirilmeli" bandına, 1'i (bozuk font/yanlış dil) 60 puanla
"kritik" bandına düşüyor — beklenen davranış.

**Entegrasyon tamamlandı:** `backend/` ve `frontend/` bu repoya taşındı
(kaynak: yukarıdaki repo, commit `ef92a7f`, `master` dalı). `backend/app/services/ai.py`'deki
`analyze_document(file_path)` artık `ai-doc-analysis/analyzer.py`'deki
`analyze_document_for_ui`'ı çağırıyor. Doğrulandı: backend'in kendi pytest
suite'i (7/7 geçti) + gerçek KTR PDF'leriyle uçtan uca upload→analiz→get
akışı (doğru puanlar veritabanına yazılıp API'den döndü). Hayrettin'in
mock fonksiyonları (`evaluate_criteria`, `analyze_category_fit`,
`check_similarity`) henüz değiştirilmedi, o hâlâ kendi kısmını yazacak.

**Ayrıca dikkat:** O repodaki tüm UI metinleri (özet/bulgu cümleleri, etiketler)
**İngilizce** yazılmış, benim ürettiğim özet/bulgular ise **Türkçe**. Bu, ekip
içinde netleştirilmesi gereken ayrı bir karar (hakem/yarışmacı kitlesi Türkçe
konuştuğu için Türkçe daha mantıklı görünüyor, ama UI zaten İngilizce metin
üzerine kurulmuş) — henüz kimse karar vermedi.

## 2. Kategori / Benzerlik / Kriter Değerlendirme (Hayrettin — `ai-scoring`)

> Henüz Hayrettin ile netleşmedi — placeholder.

```json
{
  "kategori_onerisi": "string",
  "kategori_guven_skoru": 0.0,
  "en_benzer_raporlar": [
    { "rapor_id": "string", "benzerlik_yuzdesi": 0.0 }
  ],
  "kriter_puanlari": [
    { "kriter": "string", "puan": 0, "gerekce": "string" }
  ],
  "guclu_yonler": ["string"],
  "gelisim_onerileri": ["string"]
}
```

### Referans rubrik (Havacılıkta YZ / KTR, 2022 — puanlama örneği için)

34 gerçek finalist raporundan çıkarılan bölüm puan ağırlıkları — `kriter_puanlari`
alanının nasıl doldurulabileceğine dair somut bir örnek olarak buraya not
edildi (bkz. `ai-doc-analysis/sample_reports/havacilikta_yz_ktr/Puan_Rubrigi.md`
ve `KTR_Dogrulama.csv`). **Bu rakamların içerik kalitesine göre gerçek puan
hesaplaması Hayrettin'in modülünün işi** — burada sadece hangi bölümün kaç
puan ağırlığı olduğu listeleniyor, hesaplama/skorlama yapılmadı:

| Bölüm | Puan |
|---|---|
| Takım Şeması | 5 |
| Proje Mevcut Durum Değerlendirmesi | 15 |
| Algoritmalar ve Sistem Mimarisi | 25 |
| Özgünlük | 25 |
| Sonuçlar ve İnceleme | 25 |
| Kaynakça | 5 |
| **Toplam** | **100** |

## 3. Kural Kaynağı

Zorunlu başlıklar, kabul edilen diller ve sayfa sınırları `docs/mvp-rules.json`
dosyasında tutulur — kod içine gömülmez, böylece şartname netleştikçe sadece bu
dosya güncellenir.

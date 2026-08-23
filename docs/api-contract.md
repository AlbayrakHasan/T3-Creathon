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
  "sablon_uygun": true,
  "eksik_basliklar": ["Sonuç"],
  "hatalar": []
}
```

| Alan | Tip | Açıklama |
|---|---|---|
| `dil` | string | ISO 639-1 dil kodu (`tr`, `en`, ...) ya da `unknown` |
| `sablon_uygun` | boolean | Tüm zorunlu başlıklar bulunduysa `true` |
| `eksik_basliklar` | string[] | Bulunamayan zorunlu başlıkların listesi |
| `hatalar` | string[] | Analiz sırasında oluşan hata mesajları (normal akışta boş) |

**Hata durumu (PDF okunamadıysa):**
```json
{ "hata": "PDF'ten metin çıkarılamadı (taranmış/görüntü PDF olabilir)" }
```
Bu durumda backend, raporu "işlenemedi" durumuna almalı ve hakeme/yarışmacıya
bunu bildirmeli — sistem çökmemeli.

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

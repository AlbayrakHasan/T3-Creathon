# Değişiklik ve Entegrasyon Raporu — 23 Ağustos 2026

> Bu doküman, `ai-doc-analysis` modülünün sıfırdan kuruluşundan repo
> birleştirmeye kadar yapılan tüm işi teknik olarak özetler. Ekiple
> paylaşılabilir referans dokümanı olarak yazıldı.

## 1. Özet

Proje sıfır noktasından başladı (`e1d7394`), 9 commit sonunda:
- Doküman/şablon analiz modülü (Hasan) gerçek veriyle geliştirildi ve test
  edildi
- Ayrı ilerleyen backend + frontend kodu (Mahmut/Mustafa) tek repoya
  birleştirildi ve benim modülümle gerçekten entegre edildi
- Repo GitHub'a taşındı: https://github.com/AlbayrakHasan/T3-Creathon
  (public)

**Güncel test durumu:** `ai-doc-analysis` 32/32, backend 7/7 — toplam 39
test, hepsi geçiyor. Repo GitHub ile tam senkron, çalışma ağacı temiz.

## 2. Modül geliştirme süreci (kronolojik)

### 2.1. İlk kurulum ve kural seti seçimi
- Monorepo iskeleti oluşturuldu (`frontend/`, `backend/`, `ai-doc-analysis/`,
  `ai-scoring/`, `docs/`)
- İlk `mvp-rules.json` taslağı varsayımsaldı (`Özet, Problem Tanımı, Yöntem,
  Bulgular, Sonuç`) — gerçek şartnameye dayanmıyordu
- Perplexity ile araştırma yapılarak gerçek TEKNOFEST kategorileri
  karşılaştırıldı; önce **Sağlıkta Yapay Zeka**, sonra **Havacılıkta Yapay
  Zeka (KTR — Kritik Tasarım Raporu, 2022 sezonu)** referans alındı
- Karar gerekçesi: KTR türü, 34 rapor arasında en tutarlı yapıyı (%98+)
  gösteriyordu; şablon+rapor+puan rubriği aynı türe ait

### 2.2. Gerçek veriyle doğrulama
- TEKNOFEST'in kendi sitesinden **34 gerçek finalist KTR raporu** indirildi
  (`ai-doc-analysis/sample_reports/havacilikta_yz_ktr/reports/`)
- `mvp-rules.json`'daki 6 zorunlu başlık bu 34 rapordan **ampirik olarak**
  türetildi (şartnameden değil — 2022 KTR şartnamesi artık yayında değil)
- Kendi `analyzer.py` ile bağımsız doğrulama yapıldı, Perplexity'nin
  analiziyle birebir örtüştüğü teyit edildi

### 2.3. Tespit edilen ve düzeltilen hatalar
| # | Sorun | Düzeltme |
|---|---|---|
| 1 | `kabul_edilen_diller`, `min_sayfa`/`max_sayfa` `mvp-rules.json`'da tanımlıydı ama kod hiç okumuyordu (ölü config) | `dil_uygun`, `sayfa_uygun` alanları gerçekten hesaplanır hale getirildi |
| 2 | İçerik kontrolü hiç yoktu (sadece "başlık var mı", "altı dolu mu" değil) | `icerik_yetersiz_basliklar` eklendi — bölüme özel eşik desteğiyle (`min_bolum_karakter_override`) |
| 3 | `detect_language` ilk 1000 karakteri kullanıyordu → 34 raporun 12'sinde yanlış dil (de/en) tespiti | Kapak+İçindekiler'i atlayan pencereye geçildi → doğruluk 22/34'ten 33/34'e çıktı |
| 4 | Bir örnek raporu ("KTR_13") yanlışlıkla "gerçek İngilizce rapor" olarak raporlamıştım | İçeriği bizzat okuyup tamamen Türkçe olduğunu doğruladım, test dosyasını düzelttim |
| 5 | 2026 şartnamesinin 2022 KTR verisini doğruladığı iddia edilmişti (Perplexity çıktısı) | 2026 şartnamesini bizzat okudum: "KTR" terimi hiç geçmiyor, aşama artık "Final Tasarım Raporu (FTR)" — düzeltme notu eklendi |
| 6 | Birebir kelime eşleşmesi, gerçek hakemlerin kabul ettiği ama farklı isimli yazılmış bölümleri ("Kaynakça" yerine "Referanslar") haksız yere "eksik" sayıyordu | `esanlamli_basliklar` eklendi → `sablon_uygun: true` oranı 28/34'ten 32/34'e çıktı |

## 3. Backend/Frontend konsolidasyonu

Ekibin ayrı ilerlettiği https://github.com/mahmutconger/t3creathon_web
reposu incelendi (commit `ef92a7f`, `master` dalı, git geçmişi ZIP export
olduğu için taşınamadı — `git archive` ile güncel içerik çıkarılıp doğru
klasörlere kopyalandı):
- `backend/` → doğrudan aynı yola
- `src/`, `public/`, `package.json` vb. (repo kökü) → `frontend/` altına

### 3.1. Keşfedilen format uyumsuzluğu
Backend (`AiAnalysis` veritabanı tablosu, `INTEGER` puan kolonları) ve
frontend (`src/lib/ai-analysis.ts`, hakem paneli renkli rozetleri) benimle
hiç senkron olunmadan **0-100 puan + özet + bulgu listesi** formatı üzerine
kurulmuştu:
```json
{"languageTemplate": {"score": 92, "summary": "...", "findings": [...]}}
```
Benim `analyze_document()` ise boolean/liste tabanlı bir format üretiyordu.
İki taraf da birbirinden habersiz farklı sözleşmeler üzerine çalışmış.

### 3.2. Çözüm: adaptör fonksiyon
`ai-doc-analysis/analyzer.py`'ye `analyze_document_for_ui()` eklendi —
mevcut `analyze_document()`'i çağırıp sonucu backend'in beklediği formata
çeviriyor. Puan bantları frontend'in kendi eşikleriyle hizalandı (≥85
yüksek güven, 65-84 gözden geçirilmeli, <65 kritik).

`backend/app/services/ai.py`'deki mock `analyze_document(file_path)`
silinip yerine bu adaptör bağlandı. Hayrettin'in henüz yazılmamış 3
fonksiyonu (`evaluate_criteria`, `analyze_category_fit`, `check_similarity`)
dokunulmadan mock olarak bırakıldı.

### 3.3. Doğrulama
- Backend'in kendi pytest suite'i: **7/7 geçti**
- Gerçek KTR PDF'leri API'nin `upload → arka plan analizi → get` akışından
  bizzat geçirildi:
  - `KTR_00` (tam uygun): `languageTemplate: 100`, `contentHeading: 100`
  - `KTR_12` (gerçekten eksik bölüm): `languageTemplate: 80` ("Eksik
    başlıklar: Kaynakça." bulgusuyla) — doğru şekilde "gözden geçirilmeli"
    bandına düşüyor

## 4. Repo/altyapı işlemleri

- Git deposu başlatıldı, GitHub'a taşındı: `AlbayrakHasan/T3-Creathon`
  (public — kullanıcı tercihiyle, collaborator eklemek yerine)
- Bu makinede eksik olan araçlar kuruldu: Python 3.12, `pdfplumber`,
  `langdetect`, `python-docx`
- `.gitignore` güncellendi (`backend/uploads/` eklendi — yüklenen dosyalar
  commit'lenmemeli)

## 5. Şu an bilinen sorunlar / açık konular

| Öncelik | Konu | Açıklama |
|---|---|---|
| 🔴 Güvenlik | JWT secret key sabit kodlanmış | `backend/app/auth.py:12` — `SECRET_KEY = "super-secret-t3-creathon-key"` **public repoda düz metin duruyor.** Şu an kimse gerçek veri kullanmadığı için acil değil, ama gerçek kullanım öncesi ortam değişkenine taşınmalı. İstersen şimdi düzeltebilirim |
| 🟡 Tutarlılık | Dil karışıklığı | Backend'deki 3 mock fonksiyon (Hayrettin'in yeri) + frontend etiketleri İngilizce; benim ürettiğim özet/bulgular Türkçe. Ekipçe karar verilmedi |
| 🟡 Kapsam | Hayrettin'in modülü yok | `evaluate_criteria`, `analyze_category_fit`, `check_similarity` hâlâ rastgele sayı üretiyor — gerçek değerlendirme henüz çalışmıyor |
| 🟢 Test kapsamı | Taranmış/görüntü PDF senaryosu | Elimizde böyle bir örnek yok, hiç test edilmedi (kod `hata` alanıyla düzgün karşılıyor ama gerçek örnekle doğrulanmadı) |
| 🟢 Bilinen sınırlama | Bozuk font kodlamalı PDF (KTR_08) | Kaynak dosyanın kendi sorunu, düzeltilemez — dil tespiti yanlış çıkabilir, sistem çökmüyor |
| ⚪ Kozmetik | `datetime.utcnow()` deprecation uyarıları | Backend testlerinde ~37 uyarı (Python'un gelecekte kaldıracağı bir API) — hata değil, sadece uyarı, benim eklediğim kod değil |
| ⚪ Süreç | Eski repo hâlâ var | `mahmutconger/t3creathon_web`'e commit atılmaya devam edilirse tekrar ayrışırız — ekibe "artık buradan çalışmayın" mesajı iletilmeli |

**Kırmızı olan (JWT secret) dışında hiçbiri acil/engelleyici değil.**

## 6. Sıradaki adımlar

1. JWT secret key'i ortam değişkenine taşı (istenirse hemen yapılabilir)
2. Hayrettin kendi modülünü yazsın, `ai.py`'deki 3 mock fonksiyonu değiştirsin
3. Dil kararı (Türkçe/İngilizce) ekipçe netleştirilsin
4. Eski repo hakkında ekibe bilgi verilsin

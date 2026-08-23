# teknofest-degerlendirme

T3 Vakfı Yapay Zeka Creathonu — Problem 4: TEKNOFEST rapor değerlendirme
sürecini destekleyen, **AI'nın nihai karar vermediği** bir karar destek
sistemi. AI sadece analiz/öneri üretir, nihai kararı her zaman hakem verir.

Proje bağlamı, ekip, kararlar ve zaman planı için: [`docs/CLAUDE.md`](docs/CLAUDE.md)
ve [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md).

## Klasörler ve sorumluluklar

| Klasör | Kişi | İçerik | Durum |
|---|---|---|---|
| `ai-doc-analysis/` | Hasan | Dil/şablon/başlık kontrolü | ✅ Çalışıyor, gerçek veriyle test edildi |
| `ai-scoring/` | Hayrettin | Kategori, benzerlik, kriter puanlama | 🔜 Başlanmadı |
| `backend/` | Mustafa | FastAPI + SQLite — API, veri modeli, entegrasyon | 🔜 Başlanmadı |
| `frontend/` | Mahmut | React/Next.js — rol bazlı paneller | 🔜 Başlanmadı |
| `docs/` | — | Ortak dokümanlar, API sözleşmesi, MVP kuralları | Güncel |

## Şu ana kadar tamamlanan: `ai-doc-analysis`

Rapor yüklendiğinde çalışan ilk kontrol katmanı. PDF'i alır, 5 şeyi kontrol
edip JSON döner: dil uygunluğu, sayfa sayısı uygunluğu, şablon uygunluğu
(zorunlu başlıklar), içeriği zayıf bölümler, hatalar.

**Referans veri seti:** TEKNOFEST Havacılıkta Yapay Zeka Yarışması, Kritik
Tasarım Raporu (KTR), 2022 sezonu — **34 gerçek finalist raporu** (uydurma
değil, TEKNOFEST'in kendi Derece Listesi'nden). Detay: [`ai-doc-analysis/README.md`](ai-doc-analysis/README.md).

**Son test sonucu** (`python ai-doc-analysis/tests/test_analyzer.py`):

```
25 başarılı, 0 başarısız
```

**34 gerçek rapor üzerinde toplu sonuç:**

| Sonuç | Adet | Açıklama |
|---|---|---|
| Tam uygun | 32/34 | Dil, sayfa sayısı, şablon, içerik — hepsi geçti |
| Gerçekten eksik bölüm | 1/34 | KTR_12 — "Kaynakça" (ya da eşanlamlısı) hiç yok |
| Kaynak dosya hatası | 1/34 | KTR_08 — PDF'in kendi font kodlaması bozuk (bizim kodun sorunu değil) |

Bu oranlar gerçek hakem kararlarına kasıtlı olarak yakınlaştırıldı: sistem,
"Kaynakça" yerine "Referanslar" yazan bir raporu artık haksız yere
reddetmiyor (bkz. `docs/mvp-rules.json` → `esanlamli_basliklar`).

## Hayrettin — sıradaki adımların

1. `docs/api-contract.md` **Bölüm 2**'yi oku — senin modülünün beklenen JSON
   çıktı formatı (taslak, henüz sen onaylamadın, değiştirebilirsin)
2. Aynı dosyadaki **"Referans rubrik"** bölümüne bak — 34 gerçek KTR
   raporundan çıkarılmış puan ağırlıkları (Takım Şeması 5, Proje Mevcut
   Durum 15, Algoritmalar 25, Özgünlük 25, Sonuçlar 25, Kaynakça 5 = 100).
   Kriter değerlendirme modülün için hazır bir başlangıç noktası
3. Test verisi olarak benim kullandığım 34 raporu (`ai-doc-analysis/sample_reports/havacilikta_yz_ktr/reports/`)
   sen de kullanabilirsin — kategori/benzerlik modülün için gerçek veri
4. Benimle JSON format konusunda senkron olalım — API sözleşmesi hâlâ taslak

## Mustafa — sıradaki adımların

1. `docs/api-contract.md`'deki her iki modülün (benim ve Hayrettin'in)
   çıktı JSON şemalarını incele
2. `ai-doc-analysis/analyzer.py`'deki `analyze_document(pdf_path, rules)`
   fonksiyonunu backend'den nasıl çağıracağını düşün — `rules` parametresi
   dışarıdan geliyor, yani veritabanından her yarışmaya özel kural setini
   çekip geçirebilirsin (bkz. `docs/mvp-rules.json` — bu statik dosya, senin
   veritabanı karşılığın olacak)
3. `POST /analyze-template` önerisini (api-contract.md'de) değerlendir

## Mahmut — sıradaki adımların

1. `docs/PROJECT_CONTEXT.md` Bölüm 2'deki 4 rolü (Yarışma Yöneticisi,
   Hakem, Yarışmacı, Değerlendirme Yöneticisi) incele
2. Hakem panelinde benim modülümün çıktısının (`docs/api-contract.md`
   Bölüm 1 JSON şeması) nasıl gösterileceğini düşünmeye başlayabilirsin

## Kurulum (herkes için)

```bash
pip install -r ai-doc-analysis/requirements.txt
python ai-doc-analysis/tests/test_analyzer.py
```

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
| `ai-scoring/` | Hayrettin | Kategori, benzerlik, kriter puanlama | 🔜 Başlanmadı (backend'de mock olarak duruyor) |
| `backend/` | Mustafa | FastAPI + SQLite — API, veri modeli, auth | ✅ Çalışıyor (auth, upload, analiz akışı, hakem kararı) — [mahmutconger/t3creathon_web](https://github.com/mahmutconger/t3creathon_web)'dan entegre edildi |
| `frontend/` | Mahmut | Next.js — rol bazlı paneller | ✅ Çalışıyor (4 rol paneli, hakem raporu görünümü) — aynı repodan entegre edildi |
| `docs/` | — | Ortak dokümanlar, API sözleşmesi, MVP kuralları | Güncel |

**Not:** `backend/` ve `frontend/`, Mahmut/Mustafa'nın ayrı ilerlettiği
[t3creathon_web](https://github.com/mahmutconger/t3creathon_web) reposundan
bu monorepoya taşındı (2026-08-23). O repo artık kullanılmıyor — bundan
sonra tüm çalışma buradan devam etmeli, yoksa tekrar ayrışırız.

## Şu ana kadar tamamlanan: `ai-doc-analysis` + backend entegrasyonu

Rapor yüklendiğinde çalışan ilk kontrol katmanı. PDF'i alır, 5 şeyi kontrol
edip JSON döner: dil uygunluğu, sayfa sayısı uygunluğu, şablon uygunluğu
(zorunlu başlıklar), içeriği zayıf bölümler, hatalar.

**Referans veri seti:** TEKNOFEST Havacılıkta Yapay Zeka Yarışması, Kritik
Tasarım Raporu (KTR), 2022 sezonu — **34 gerçek finalist raporu** (uydurma
değil, TEKNOFEST'in kendi Derece Listesi'nden). Detay: [`ai-doc-analysis/README.md`](ai-doc-analysis/README.md).

**Son test sonucu** (`python ai-doc-analysis/tests/test_analyzer.py`):

```
32 başarılı, 0 başarısız
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

**Backend entegrasyonu:** Ayrı ilerleyen repoyu incelerken, backend + hakem
panelinin benim modülümden **farklı bir JSON formatı** (0-100 puan +
özet/bulgu) beklediği ortaya çıktı — birbirimizden habersiz farklı
sözleşmeler üzerine çalışmışız. `analyze_document_for_ui()` adlı bir
adaptör yazıp `backend/app/services/ai.py`'ye bağladım, backend'in kendi
test suite'i (7/7) ve gerçek KTR PDF'leriyle uçtan uca (upload→analiz→get)
doğrulandı. Detay: `docs/api-contract.md` Bölüm 1.

## Hayrettin — sıradaki adımların

1. `docs/api-contract.md` **Bölüm 2**'yi oku — senin modülünün beklenen JSON
   çıktı formatı (taslak, henüz sen onaylamadın, değiştirebilirsin)
2. Aynı dosyadaki **"Referans rubrik"** bölümüne bak — 34 gerçek KTR
   raporundan çıkarılmış puan ağırlıkları (Takım Şeması 5, Proje Mevcut
   Durum 15, Algoritmalar 25, Özgünlük 25, Sonuçlar 25, Kaynakça 5 = 100).
   Kriter değerlendirme modülün için hazır bir başlangıç noktası
3. Test verisi olarak benim kullandığım 34 raporu (`ai-doc-analysis/sample_reports/havacilikta_yz_ktr/reports/`)
   sen de kullanabilirsin — kategori/benzerlik modülün için gerçek veri
4. `backend/app/services/ai.py`'deki `evaluate_criteria`, `analyze_category_fit`,
   `check_similarity` fonksiyonları hâlâ mock (rastgele sayı üretiyor) —
   senin gerçek kodun bunların yerine geçecek. Aynı dosyada benim
   `analyze_document`'i nasıl entegre ettiğimi örnek alabilirsin

## Mustafa — durum

Backend zaten senin elinden çıkma haliyle bu repoya taşındı, benim
modülümle entegre edildi ve test edildi (bkz. yukarısı). Sıradaki: Hayrettin
kendi modülünü yazınca `ai.py`'deki kalan 3 mock fonksiyonu onunla
değiştirmesine yardım et.

## Mahmut — durum

Frontend zaten bu repoya taşındı. Bir açık konu var: senin arayüz
metinlerin (özet/bulgu cümleleri) İngilizce, benim ürettiğim özet/bulgular
Türkçe — hangisinde karar kılacağımızı ekipçe konuşmamız lazım (bkz.
`docs/api-contract.md`).

## Kurulum (herkes için)

```bash
# ai-doc-analysis
pip install -r ai-doc-analysis/requirements.txt
python ai-doc-analysis/tests/test_analyzer.py

# backend
pip install -r backend/requirements.txt
cd backend && python -m pytest tests/ -v

# frontend
cd frontend && npm install && npm run dev
```

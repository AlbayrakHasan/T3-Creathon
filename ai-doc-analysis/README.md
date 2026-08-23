# ai-doc-analysis — Doküman & Şablon Analizi (Hasan)

Rapor yüklendiğinde çalışan **ilk kontrol katmanı**. Bir PDF'i alır, üç şeyi
kontrol eder ve bunu tek bir JSON olarak döner: dil, şablon uygunluğu (zorunlu
başlıklar var mı), ve varsa hatalar.

Bunu bir havaalanı güvenlik kontrolüne benzetebilirsin: uçağa binmeden önceki
ilk, hızlı kontrol noktası. Detaylı inceleme (kategori, benzerlik, kriter
puanlama — Hayrettin'in modülü) daha sonra gelir.

## Neden API'ye ihtiyaç yok?

Dil tespiti (`langdetect`) ve başlık arama işlemleri tamamen kural tabanlı ve
yerel çalışıyor — internet/LLM gerekmiyor. Bu, bu modülü Hayrettin'in Claude
API'ye bağımlı modülünden bağımsız kılıyor: o API sözleşmesini beklerken sen
zaten ilerleyebiliyorsun.

## Kurulum

```bash
pip install -r requirements.txt
```

## Kullanım

Tek bir PDF'i komut satırından test etmek için:

```bash
python analyzer.py sample_reports/havacilikta_yz_ktr/reports/KTR_00_YXpGnt7IevOLKmM75xNlXyQlgHmz2bTM.pdf
```

Kod içinden çağırmak için (backend'in yapacağı şey budur):

```python
from analyzer import analyze_document, load_rules

rules = load_rules()  # docs/mvp-rules.json'dan okur
sonuc = analyze_document("bir_rapor.pdf", rules)
```

## Testleri çalıştırma

```bash
python tests/test_analyzer.py
```

## Dosyalar

- `analyzer.py` — asıl mantık: `extract_text`, `detect_language`,
  `check_template`, `analyze_document`
- `sample_reports/` — **gerçek** TEKNOFEST materyalleri:
  - `havacilikta_yz_ktr/` — **ana referans veri setimiz.** Havacılıkta Yapay
    Zeka Yarışması, Kritik Tasarım Raporu (KTR), 2022 sezonu:
    - `reports/` — **34 gerçek finalist raporu** (TEKNOFEST Derece
      Listesi'nden, Perplexity ile araştırılıp indirildi)
    - `KTR_Dogrulama.csv` — 34 raporun her birinde 6 zorunlu bölümün
      birebir/farklı-isim/yok durumu (%98+ tutarlılık) — kendi
      `analyzer.py`'mizle bağımsız doğrulandı (bkz. `tests/test_analyzer.py`)
    - `Puan_Rubrigi.md` — bölüm puan ağırlıkları (Hayrettin'in modülü için,
      bkz. `docs/api-contract.md`)
    - `sartname_genel_2026.pdf`, `sartname_teknik_2026.pdf` — güncel
      şartnameler (2022'ninki artık yayında değil)
    - `sablon_OTR_2026.docx` — güncel (erken aşama) resmi şablon; KTR
      şablonu artık sitede yok, bu yüzden başlıklar raporlardan çıkarıldı
  - `saglikta_yz_pdr_zebot-e1.pdf`, `saglikta_yz_pdr_ckup.pdf` — **farklı bir
    yarışmadan** (Sağlıkta Yapay Zeka) gerçek raporlar. Artık kural setimize
    uymuyorlar — kasıtlı olarak "yanlış şablon kullanma" test senaryosu
    olarak tutuluyor
  - `referans_2026_pdr_sablonu_universite.docx` — eski referans, artık
    kullanılmıyor
- `tests/test_analyzer.py` — pytest gerektirmeyen, hafif test scripti

## Bilinen sınırlamalar

- `pdfplumber` taranmış/görüntü PDF'lerden metin çıkaramaz. Bu durumda
  `analyze_document`, `{"hata": "..."}` döner, çökmez.
- Çok kısa metinlerde `langdetect` yanlış tahmin yapabilir (`unknown`
  dönebilir).
- Türkçe büyük/küçük harf (İ/i, I/ı) farkı, `analyzer.py` içindeki
  `_turkish_casefold` fonksiyonuyla ele alınıyor ve test edildi (bkz.
  `tests/test_analyzer.py`).

## Hâlâ yapılmadı / sıradaki adımlar

- [x] `docs/mvp-rules.json`'daki `zorunlu_basliklar` listesi artık 34 gerçek
  finalist raporundan türetildi ve bağımsız test edildi
- [x] Farklı kalitede gerçek örnekler var: 29/34 uygun, 5/34 eksik/farklı
  başlıklı, 1 tanesi yanlış dilde (İngilizce) — hepsi gerçek, uydurma değil
- [ ] Taranmış/görüntü PDF senaryosu hâlâ test edilmedi (elimizde öyle bir
  örnek yok)
- [ ] Hayrettin ile JSON format anlaşması resmileştirilmedi (taslak:
  `docs/api-contract.md`)
- [ ] Mustafa ile gerçek API endpoint'i (`/analyze-template` önerisi)
  netleşmedi

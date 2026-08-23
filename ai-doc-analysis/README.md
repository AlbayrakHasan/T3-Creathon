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
python analyzer.py sample_reports/ornek_sartname.pdf
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
- `sample_reports/` — test için örnek PDF'ler (gerçek TEKNOFEST raporu değil,
  şu an sadece dil tespitini doğrulamak için kullanılıyor — FAZ 1'in "4-5
  örnek rapor toplama" görevi hâlâ açık)
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

- [ ] `docs/mvp-rules.json`'daki `zorunlu_basliklar` listesi **varsayımsal** —
  gerçek TEKNOFEST rapor şablonu araştırılıp güncellenmeli
  (bkz. `docs/CLAUDE.md` Bölüm 6 — Perplexity araştırma prompt'u)
- [ ] Gerçek/gerçekçi 4-5 örnek rapor toplanmadı (`sample_reports/` şu an tek,
  ilgisiz bir belge içeriyor — sadece dil tespiti testi için)
- [ ] Hayrettin ile JSON format anlaşması resmileştirilmedi (taslak:
  `docs/api-contract.md`)
- [ ] Mustafa ile gerçek API endpoint'i (`/analyze-template` önerisi)
  netleşmedi

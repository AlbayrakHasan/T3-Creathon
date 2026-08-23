# ai-doc-analysis — Doküman & Şablon Analizi (Hasan)

Rapor yüklendiğinde çalışan **ilk kontrol katmanı**. Bir PDF'i alır, beş şeyi
kontrol eder ve bunu tek bir JSON olarak döner: dil uygunluğu, sayfa sayısı
uygunluğu, şablon uygunluğu (zorunlu başlıklar var mı), başlığı olup içeriği
zayıf bölümler, ve varsa hatalar.

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
    - `sartname_genel_2026.pdf`, `sartname_teknik_2026.pdf` — 2022'ninki
      artık yayında olmadığı için indirilen en yakın güncel şartname.
      **DİKKAT:** bunlar doğrulanmış bir referans değil — 2026 şartnamesinde
      "KTR" terimi bile geçmiyor, bu aşama artık "Final Tasarım Raporu (FTR)"
      olarak adlandırılıyor (madde 5.2). `zorunlu_basliklar` listemiz bu
      şartnamelerden değil, doğrudan 2022 raporlarının kendisinden geliyor —
      detay: `sample_reports/havacilikta_yz_ktr/README.md` "DÜZELTME" notu
    - `sablon_OTR_2026.docx` — güncel (erken aşama) resmi şablon; KTR/FTR
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
- Bazı PDF'lerin **font kodlaması bozuk** olabiliyor (Word/PDF dönüştürücü
  hatası — gerçek örnek: `KTR_08`'de bazı "İ" harfleri "Ġ" olarak çıkıyor).
  Bu, kaynak dosyanın sorunu; `pdfplumber` ne çıkarırsa onu işliyoruz. Bu
  durumda dil tespiti (ve teorik olarak başlık eşleştirmesi) yanlış
  çıkabilir — sistem çökmez ama sonuç güvenilmez olabilir.
- `detect_language`, metnin kapak+İçindekiler kısmını atlayıp ortasından bir
  pencere kullanıyor (ilk 1000 karakter yerine) — 34 gerçek raporda bu
  değişiklik doğruluğu %65'ten (22/34) %97'ye (33/34) çıkardı. Kalan tek
  istisna yukarıdaki font kodlaması bozuk dosya.
- `icerik_yetersiz_basliklar`, bölümün *var olup olmadığına* kaba bir bakış —
  içerik *kalitesini* değerlendirmiyor (bkz. `docs/api-contract.md`).
- Türkçe büyük/küçük harf (İ/i, I/ı) farkı, `analyzer.py` içindeki
  `_turkish_casefold` fonksiyonuyla ele alınıyor ve test edildi (bkz.
  `tests/test_analyzer.py`).

## Hâlâ yapılmadı / sıradaki adımlar

- [x] `docs/mvp-rules.json`'daki `zorunlu_basliklar` listesi artık 34 gerçek
  finalist raporundan türetildi ve bağımsız test edildi
- [x] Dil uygunluğu (`dil_uygun`) ve sayfa sayısı uygunluğu (`sayfa_uygun`)
  artık gerçekten kontrol ediliyor — önceden `mvp-rules.json`'da tanımlı
  olup koddan hiç okunmayan "ölü" alanlardı
- [x] Minimal içerik kontrolü (`icerik_yetersiz_basliklar`) eklendi —
  bölüme özel eşik (`min_bolum_karakter_override`) ile "Takım Şeması" gibi
  doğal olarak kısa bölümlerde yanlış alarm vermiyor
- [x] 34 raporun tamamı üzerinde test edildi: 28/34 sorunsuz, 5/34 gerçek
  başlık uyumsuzluğu, 1/34 kaynak PDF'in kendi font hatası — hepsi gerçek,
  uydurma değil
- [ ] Taranmış/görüntü PDF senaryosu hâlâ test edilmedi (elimizde öyle bir
  örnek yok)
- [ ] Hayrettin ile JSON format anlaşması resmileştirilmedi (taslak:
  `docs/api-contract.md`)
- [ ] Mustafa ile gerçek API endpoint'i (`/analyze-template` önerisi)
  netleşmedi

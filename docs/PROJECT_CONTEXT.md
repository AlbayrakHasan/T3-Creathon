# Proje Bağlamı: TEKNOFEST Yapay Zeka Destekli Değerlendirme Sistemi

> Bu doküman, T3 Vakfı Yapay Zeka Creathonu — Problem 4 için geliştirilen projenin
> tam teknik bağlamını içerir. AI kod asistanlarına (Claude Code, Cursor, vb.)
> bu dokümanı vererek projenin ne olduğunu, mimarisini ve kararlarını anlatabilirsiniz.

---

## 1. Proje Nedir?

TEKNOFEST yarışmalarında hakemler her raporu elle kontrol ediyor: dil/şablon uygunluğu,
zorunlu başlıkların varlığı, kategori uygunluğu, benzerlik/intihal şüphesi ve kriter
bazlı puanlama. Bu, yüksek hacimde ve tekrarlayan bir iş yükü yaratıyor, hakemin
uzmanlığını temel kontrollere harcatıyor.

**Çözüm:** Bu kontrollerin tamamını tek bir sistemde birleştiren, hakeme otomatik
ön analiz ve ön değerlendirme sunan bir karar destek sistemi.

**KRİTİK İLKE:** Yapay zeka **nihai karar verici değildir**. Sistem sadece analiz/öneri
üretir; nihai kararı her zaman insan (hakem) verir. Bu ilke hem mimaride
(hakem her zaman AI önerisini değiştirebilir/onaylayabilir) hem kullanıcı arayüzünde
net şekilde yansıtılmalıdır.

## 2. Sistemdeki 4 Rol

| Rol | Görev |
|---|---|
| **Yarışma Yöneticisi** | Rapor şablonunu, kategori bilgilerini, değerlendirme kriterlerini tanımlar |
| **Hakem / Değerlendirici** | AI analizini inceler, nihai kararı verir |
| **Yarışmacı** | Kendi raporunun sonucunu, güçlü/zayıf yönlerini görür |
| **Değerlendirme Yöneticisi** | Genel süreç durumunu, tamamlanma oranlarını izler |

## 3. MVP'nin 6 Zorunlu Maddesi

Aşağıdakilerin **hepsi** çalışır olmalı — biri eksikse sistem eksik sayılır:

1. Dil/şablon kontrolü
2. Başlık/içerik kontrolü
3. Kategori uygunluğu
4. Benzerlik analizi
5. AI kriter değerlendirmesi (puan + gerekçe)
6. Hakemin bunları görüp nihai kararı verebildiği arayüz

## 4. Ekip ve Sorumluluk Alanları

| Kişi | Alan | Sorumluluk |
|---|---|---|
| Mahmut | Frontend | Rol bazlı arayüzler (4 rolün paneli), kullanıcı deneyimi |
| Mustafa | Backend | Veri modeli, API, AI modüllerinin entegrasyonu, auth |
| **Hasan (ben)** | **AI - Doküman & Şablon Analizi** | **Dil tespiti, metin çıkarma, şablon/başlık kontrolü** |
| Hayrettin | AI - Kriter Değerlendirme & Benzerlik | LLM ile kriter puanlama, kategori sınıflandırma, benzerlik analizi |

---

## 5. Teknik Yığın (Tech Stack) Kararları

| Katman | Seçim | Gerekçe |
|---|---|---|
| Kod deposu | **Tek GitHub repo (monorepo)** | 2 günlük süreçte ayrı repoları senkronize etmeye vakit yok; herkes kendi klasöründe bağımsız çalışır |
| Frontend | **React / Next.js** | Web tabanlı hakem paneli hızlı geliştirilir, demo sırasında pratiktir |
| Backend | **FastAPI (Python) + SQLite** | Kurulumu hızlı, sıfır konfigürasyon; 2 günlük hackathonda hıza öncelik verilir (ihtiyaç halinde SQLAlchemy ORM ile PostgreSQL'e geçiş kolaydır) |
| LLM API | **Claude API** | Creathon şartnamesinde finalist takımlara ücretsiz kredi taahhüt edilmiş; eğitim modülünde de Claude odaklı prototipleme öğretiliyor |
| Doküman analizi (Hasan) | `pdfplumber` (metin çıkarma), `langdetect` (dil tespiti), kural tabanlı başlık/şablon kontrolü | Yerel çalışır, API bağımlılığı yok, hızlı ve bağımsız geliştirilebilir |
| Kategori/Benzerlik (Hayrettin) | `sentence-transformers` (embedding) + cosine similarity | Standart, hızlı, açık kaynak yaklaşım |
| Kriter değerlendirme (Hayrettin) | Claude API ile rubrik tabanlı prompt, JSON çıktı (puan + gerekçe) | Yapılandırılmış, tutarlı çıktı üretir |

### Repo Klasör Yapısı

```
teknofest-degerlendirme/
├── frontend/              # Mahmut - React/Next.js
├── backend/               # Mustafa - FastAPI + SQLite
├── ai-doc-analysis/       # Hasan - dil/şablon/başlık kontrolü
├── ai-scoring/            # Hayrettin - kriter/kategori/benzerlik
└── docs/
    ├── PROJECT_CONTEXT.md # Bu dosya
    ├── api-contract.md    # Endpoint ve JSON şemaları
    └── mvp-rules.json     # Zorunlu başlıklar, diller, vb. kurallar
```

---

## 6. Hasan'ın Modülü — Detaylı Teknik Spesifikasyon

### Amaç
Bir rapor yüklendiğinde, sistemin **ilk kontrol katmanı** olarak çalışır. Girdi: PDF
rapor dosyası. Çıktı: dil, şablon uygunluğu ve eksik başlıklar bilgisini içeren
standart bir JSON.

### Kullanılan Kütüphaneler
```bash
pip install pdfplumber langdetect --break-system-packages
```

### Kural Deposu (`mvp-rules.json`)
Kurallar kodun içine gömülmez, ayrı bir config dosyasında tutulur ki güncellenmesi
kod değişikliği gerektirmesin:

```json
{
  "kabul_edilen_diller": ["tr"],
  "zorunlu_basliklar": ["Özet", "Problem Tanımı", "Yöntem", "Bulgular", "Sonuç"],
  "min_sayfa": 3,
  "max_sayfa": 15
}
```

> NOT: Bu kurallar, ekip tarafından TEKNOFEST şartnamesi/şablonu incelenerek
> netleştirilecek ve güncellenecektir.

### Temel Fonksiyonlar

```python
import pdfplumber
from langdetect import detect
import json

def extract_text(pdf_path: str) -> str:
    """PDF'ten düz metin çıkarır."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def detect_language(text: str) -> str:
    """Metnin dilini tespit eder."""
    try:
        return detect(text[:1000])
    except Exception:
        return "unknown"

def check_template(text: str, rules: dict) -> dict:
    """Zorunlu başlıkların varlığını kontrol eder."""
    eksik = [b for b in rules["zorunlu_basliklar"] if b.lower() not in text.lower()]
    return {
        "sablon_uygun": len(eksik) == 0,
        "eksik_basliklar": eksik
    }

def analyze_document(pdf_path: str, rules: dict) -> dict:
    """Tüm kontrolleri birleştirip standart JSON döner."""
    try:
        text = extract_text(pdf_path)
        if not text.strip():
            return {"hata": "PDF'ten metin çıkarılamadı (taranmış/görüntü PDF olabilir)"}

        dil = detect_language(text)
        sablon = check_template(text, rules)

        return {
            "dil": dil,
            "sablon_uygun": sablon["sablon_uygun"],
            "eksik_basliklar": sablon["eksik_basliklar"],
            "hatalar": []
        }
    except Exception as e:
        return {"hata": str(e)}
```

### Çıktı Formatı (Diğer Modüllerin Beklediği JSON Şeması)

```json
{
  "dil": "tr",
  "sablon_uygun": true,
  "eksik_basliklar": ["Sonuç"],
  "hatalar": []
}
```

Bu JSON, **backend'e (Mustafa)** iletilir ve backend bunu veritabanına kaydedip
**Hayrettin'in modülüne** ve **hakem paneline** aktarır.

### Bilinen Sınırlamalar / Dikkat Edilecekler
- `pdfplumber`, taranmış (görüntü) PDF'lerden metin çıkaramaz — bu durumda
  `"hata": "PDF'ten metin çıkarılamadı"` dönülmeli, sistem çökmemeli.
- Çok kısa metinlerde (`langdetect`) yanlış dil tahmini yapabilir — ilk 1000
  karakter yeterli, ama boş/çok kısa metinlerde hata kontrolü şart.
- Başlık kontrolü basit string arama ile yapılıyor; büyük/küçük harf, Türkçe
  karakter (İ/i, Ğ/ğ) farklılıkları test edilmeli.

---

## 7. Sistem Akışı (Uçtan Uca)

```
1. Yarışmacı raporu yükler
2. Backend, Hasan'ın modülünü tetikler (dil/şablon/başlık kontrolü)
3. Backend, Hayrettin'in modülünü tetikler (kategori/benzerlik/kriter puanı)
4. Sonuçlar veritabanına kaydedilir
5. Hakem panelinde tüm analiz tek ekranda gösterilir
6. Hakem inceler, gerekirse değiştirir, nihai kararını onaylar
7. Yarışmacı sonucunu (güçlü/zayıf yönler, öneriler) görür
```

## 8. Kritik Hatırlatmalar

- **AI karar verici değil** — sistem tasarımında ve sunumda bu net vurgulanmalı.
- **Standartlık** — tüm kurallar (zorunlu başlıklar, kriter ağırlıkları) config
  dosyalarında tutulur; her rapor aynı kurallarla, tutarlı şekilde kontrol edilir.
- **Erken JSON format anlaşması** (Hasan ↔ Hayrettin ↔ Backend) entegrasyon
  riskini büyük ölçüde azaltır — bu doküman o anlaşmanın referans noktasıdır.
- MVP'nin 6 maddesinden biri eksikse değerlendirmeye geçilemez — görsel
  cilalamadan önce hepsinin çalıştığından emin olun.

---

## 9. Zaman Çizelgesi (Özet)

| Faz | İçerik |
|---|---|
| 1 | Kurulum, kural netleştirme, örnek rapor toplama, API sözleşmesi |
| 2 | Paralel geliştirme - temel iskelet (mock veriyle) |
| 3 | Paralel geliştirme - modül derinleştirme |
| 4 | Entegrasyon (kritik faz) |
| 5 | Kalan MVP maddeleri, uçtan uca akışlar |
| 6 | Test ve cilalama |
| 7 | Sunum hazırlığı (3-4 dk demo + jüri soruları) |

**Kritik tarih:** 6 Eylül — Demo Day (5 dk sunum + 5 dk soru-cevap)

# CLAUDE.md — Proje Bağlamı ve Konuşma Geçmişi

> Bu dosya, T3 Vakfı Yapay Zeka Creathonu — Problem 4 projesi için claude.ai'de
> yapılan planlama sohbetinin tam özetidir. Claude Code bu dosyayı her oturum
> başında otomatik okur. Amaç: Claude Code'un, claude.ai'de zaten konuşulmuş
> tüm kararları, tartışmaları ve gerekçeleri baştan bilmesi — tekrar anlatmaya
> gerek kalmaması.

---

## 0. Ben Kimim (Kullanıcı Bağlamı)

- 4 kişilik bir Creathon takımındayım.
- Görevim: **"Al-Doküman & Şablon Analizi"** (Hasan'ın rolü — Mekatronik/AI).
- Bu alanda çok deneyimli değilim, açıklamaların basit ve adım adım olmasını
  istiyorum. Kararların *neden* alındığını da anlamak istiyorum, sadece
  "ne yapılacağını" değil.
- Şu ana kadar hiçbir kod yazılmadı, hiçbir örnek rapor toplanmadı — **sıfır
  noktasındayız.**

---

## 1. Yarışma Bağlamı (Şartname)

- Program: T3 Vakfı Yapay Zeka Creathonu.
- Takım yapısı: 3-4 kişi, disiplinler arası.
- **Kritik tarihler:**
  - 26 Ağustos, 10:00 — Ön görevlerin (iş modeli canvas, video, sunum) teslimi
    (finalist seçimi için, henüz teknik ürün değil)
  - 29 Ağustos — Finalist takımların açıklanması
  - 5 Eylül (1. gün) — Creathon açılışı, problem analizi, mentörlük
  - **6 Eylül (2. gün) — Demo Day**: 5 dk sunum + 5 dk soru-cevap
- **KVKK zorunluluğu:** Geliştirilen çözüm 6698 sayılı KVKK'ya uygun olmalı.
  Hassas verilerin anonimleştirilmesi/maskelenmesi takımın sorumluluğu.
- **API desteği:** Finale kalan takımlara **Claude ve Lovable** platformlarında
  ücretsiz API/geliştirici kredisi veriliyor (henüz bize ulaşmadı ama biz
  zaten kendi kendimize AI destekli çalışıyoruz — bu sohbet üzerinden).
- **Gizlilik:** Program süresince erişilen T3 Vakfı verileri üçüncü taraflarla
  paylaşılamaz.
- Genel kural: Her takım tek bir proje üzerinde çalışır.

---

## 2. Problem 4 — Ne İnşa Ediyoruz

**Sorun:** TEKNOFEST'te hakemler her raporu elle kontrol ediyor (dil/şablon,
başlık/içerik, kategori, benzerlik, kriter puanlama). Bu, hakemin zamanını
tüketiyor, tutarsızlık yaratıyor, yarışmacıya kaliteli geri bildirim verilemiyor.

**Çözüm:** Tüm bu kontrolleri birleştiren, hakeme otomatik ön analiz/ön
değerlendirme sunan bir karar destek sistemi.

**KRİTİK İLKE:** AI nihai karar verici DEĞİL. Sadece analiz/öneri üretir,
karar her zaman hakemde kalır. Bu, hem mimaride hem Demo Day sunumunda
mutlaka vurgulanmalı (jüri muhtemelen soracaktır).

### 4 Rol
1. **Yarışma Yöneticisi** — şablon, kategori, kriterleri tanımlar
2. **Hakem/Değerlendirici** — AI analizini inceler, nihai kararı verir
3. **Yarışmacı** — sonucunu, güçlü/zayıf yönlerini görür
4. **Değerlendirme Yöneticisi** — süreç durumunu, tamamlanma oranlarını izler

### MVP'nin 6 Zorunlu Maddesi (biri eksikse sistem "eksik" sayılır)
1. Dil/şablon kontrolü ← **benim modülüm**
2. Başlık/içerik kontrolü ← **benim modülüm**
3. Kategori uygunluğu (Hayrettin)
4. Benzerlik analizi (Hayrettin)
5. AI kriter değerlendirmesi — puan + gerekçe (Hayrettin)
6. Hakemin görüp onaylayabildiği arayüz (Mahmut/Mustafa)

---

## 3. Ekip

| Kişi | Alan | Sorumluluk |
|---|---|---|
| Mahmut | Frontend | Rol bazlı paneller, UX |
| Mustafa | Backend | Veri modeli, API, entegrasyon, auth |
| **Hasan (ben)** | **AI — Doküman & Şablon Analizi** | **Dil tespiti, metin çıkarma, şablon/başlık kontrolü** |
| Hayrettin | AI — Kriter & Benzerlik | LLM kriter puanlama, kategori sınıflandırma, benzerlik |

**Not:** Aşağıdaki tech-stack kararları şu an sadece ben (kullanıcı) ve Claude
arasında konuşuldu — **Mahmut ve Mustafa'nın onayı henüz alınmadı.** Grup
mesajı hazır ama henüz atılmadı (bkz. Bölüm 7).

---

## 4. Teknik Kararlar (Onaylandı — kullanıcı tarafından)

| Katman | Seçim | Gerekçe |
|---|---|---|
| Kod deposu | Tek GitHub repo (monorepo) | 2 günlük sürede ayrı repo senkronizasyonu vakit kaybettirir |
| Frontend | React / Next.js | Web tabanlı hakem paneli hızlı geliştirilir, demoda pratik |
| Backend | FastAPI + SQLite | Sıfır kurulum, hıza öncelik; ihtiyaçta PostgreSQL'e geçiş kolay |
| LLM API | Claude API | Şartnamede taahhüt edilen destek, eğitimlerde de öğretiliyor |
| Doküman analizi (benim) | `pdfplumber`, `langdetect`, kural tabanlı kontrol | Yerel çalışır, API'ye ihtiyaç yok, bağımsız ilerlenebilir |
| Kategori/Benzerlik (Hayrettin) | `sentence-transformers` + cosine similarity | Standart, açık kaynak |
| Kriter değerlendirme (Hayrettin) | Claude API, rubrik tabanlı prompt, JSON çıktı | Yapılandırılmış çıktı |

### Repo Yapısı
```
teknofest-degerlendirme/
├── frontend/              # Mahmut
├── backend/               # Mustafa
├── ai-doc-analysis/       # Hasan (ben)
├── ai-scoring/            # Hayrettin
└── docs/
    ├── CLAUDE.md          # Bu dosya
    ├── api-contract.md    # Endpoint ve JSON şemaları
    └── mvp-rules.json     # Zorunlu başlıklar, diller, vb.
```

---

## 5. Benim Modülüm — Detaylı Spesifikasyon

### Amaç
Rapor yüklendiğinde çalışan **ilk kontrol katmanı**. Girdi: PDF. Çıktı: standart
JSON (dil, şablon uygunluğu, eksik başlıklar).

### Neden LLM API Gerekmiyor
Bu modül tamamen kural tabanlı ve yerel çalışıyor — dil tespiti ve başlık arama
işlemleri API'ye ihtiyaç duymuyor. Bu benim için avantaj: Hayrettin'in API'ye
bağımlı modülünden bağımsız, kendi başıma ilerleyebiliyorum.

### Kurulum
```bash
pip install pdfplumber langdetect --break-system-packages
```

### Kural Deposu (`mvp-rules.json`) — TASLAK, gerçek şartname ile güncellenecek
```json
{
  "kabul_edilen_diller": ["tr"],
  "zorunlu_basliklar": ["Özet", "Problem Tanımı", "Yöntem", "Bulgular", "Sonuç"],
  "min_sayfa": 3,
  "max_sayfa": 15
}
```
⚠️ Bu liste **varsayımsal** — henüz gerçek TEKNOFEST şartnamesi/şablonu
araştırılmadı (bkz. Bölüm 6, Perplexity prompt'u).

### Fonksiyonlar (yazıldı, henüz test edilmedi)

```python
import pdfplumber
from langdetect import detect
import json

def extract_text(pdf_path: str) -> str:
    """PDF'ten düz metin çıkarır. Taranmış/görüntü PDF'lerde boş dönebilir."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def detect_language(text: str) -> str:
    """İlk 1000 karakterden dil tespiti yapar. Kısa/bozuk metinde 'unknown' döner."""
    try:
        return detect(text[:1000])
    except Exception:
        return "unknown"

def check_template(text: str, rules: dict) -> dict:
    """Zorunlu başlıkların metinde olup olmadığını kontrol eder (case-insensitive)."""
    eksik = [b for b in rules["zorunlu_basliklar"] if b.lower() not in text.lower()]
    return {
        "sablon_uygun": len(eksik) == 0,
        "eksik_basliklar": eksik
    }

def analyze_document(pdf_path: str, rules: dict) -> dict:
    """Ana giriş noktası — backend sadece bu fonksiyonu çağırır."""
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

### Çıktı JSON Şeması (Hayrettin ve Mustafa ile paylaşılacak sözleşme)
```json
{
  "dil": "tr",
  "sablon_uygun": true,
  "eksik_basliklar": ["Sonuç"],
  "hatalar": []
}
```

### Bilinen Sınırlamalar
- `pdfplumber` taranmış/görüntü PDF'lerden metin çıkaramaz → `analyze_document`
  bunu `hata` alanıyla düzgün şekilde bildiriyor, çökmüyor.
- Türkçe karakter (İ/i, Ğ/ğ) farklılıkları başlık aramada test edilmeli.
- Çok kısa metinlerde `langdetect` yanlış tahmin yapabilir.

### ŞU ANA KADAR YAPILANLAR / YAPILMAYANLAR
- [x] Kütüphaneler netleşti (`pdfplumber`, `langdetect`)
- [x] Fonksiyonlar yazıldı (yukarıda)
- [ ] **Gerçek bir PDF ile test edilmedi** — bir sonraki adım bu
- [ ] Örnek rapor seti (4-5 adet, farklı kalitede) henüz toplanmadı
- [ ] `zorunlu_basliklar` listesi gerçek şartname ile güncellenmedi
- [ ] Hayrettin ile JSON format anlaşması resmi olarak yapılmadı
- [ ] Mustafa ile API sözleşmesi (endpoint) netleşmedi

---

## 6. Perplexity Araştırma Prompt'u (henüz çalıştırılmadı)

Farklı TEKNOFEST kategorilerinin farklı şartnameleri olabileceği için, kategori
bazlı ayrılmış bir arama yapılacak:

```
TEKNOFEST yarışmaları için rapor şartnamelerini bulmama yardım et. Aşağıdaki
adımları takip et:

ADIM 1 - Genel/Ortak Kurallar:
Tüm TEKNOFEST kategorilerinde ortak olan genel rapor yazım kurallarını bul
(sayfa formatı, yazı tipi, genel bölüm yapısı gibi TEKNOFEST çapında standart
olanlar). Bunun resmi kaynağını (teknofest.org) belirt.

ADIM 2 - Kategori Bazlı Ayrım:
TEKNOFEST'in mevcut yarışma kategorilerinin bir listesini çıkar (örn: İnsansız
Hava Araçları, Sağlıkta Yapay Zeka, Eğitim Teknolojileri, Doğal Dil İşleme,
Siber Güvenlik, vb.) Her kategori için AYRI AYRI şunu belirt:
- Kategori adı
- Bu kategoriye özel rapor şartnamesi var mı, yoksa genel şartname mi geçerli
- Varsa, bu kategoriye özel zorunlu bölüm başlıkları neler
- Varsa, resmi şablon dosyası linki

ADIM 3 - Puanlama/Değerlendirme Kriterleri:
Yukarıdaki kategorilerden en az 2-3 tanesi için jüri değerlendirme
kriterlerini/rubriklerini bul, kriterlerin ağırlıklarını belirt.

Sonuçları tablo halinde, kategori bazlı ayrılmış şekilde sun. Her bilgi için
kaynağı ve hangi yıla ait olduğunu (2025-2026) belirt.

Not: Bu bilgileri "Yapay Zeka Creathon" adlı bir hackathon projesinde, gerçekçi
bir örnek/referans şablon oluşturmak için kullanacağım.
```

Sonuç geldiğinde: hangi kategoriyi "örnek/referans" alacağımıza birlikte karar
verilecek, `mvp-rules.json` o veriyle güncellenecek.

---

## 7. Grup Mesajı (hazır, henüz atılmadı)

Aşağıdaki mesaj, tüm kararlar netleşip ekip onayı alındıktan sonra gruba
atılacak (kullanıcı "her şey netleşince atarız" dedi):

```
Arkadaşlar, Problem 4 için teknik kurulumu netleştirdim, kısaca özetliyorum:

📁 KOD DEPOSU: Tek GitHub repo (monorepo) kullanacağız. Herkesin kendi
klasörü olacak:
- frontend/ → Mahmut
- backend/ → Mustafa
- ai-doc-analysis/ → Hasan (ben)
- ai-scoring/ → Hayrettin

🤖 LLM: Claude API kullanıyoruz. Şartnamede finalist olursak ücretsiz kredi
verileceği yazıyor, ayrıca eğitimlerde de Claude odaklı anlatım var.

🗄️ VERİTABANI: Backend için FastAPI + SQLite. Kurulumu hızlı, 2 günlük
süreçte zaman kaybettirmiyor.

Bu hafta içinde şunları yapmamız lazım:
1. MVP'nin 6 zorunlu maddesini birlikte netleştirelim
2. En az 4-5 örnek rapor toplayalım/oluşturalım
3. Mustafa ile Mahmut API sözleşmesini belirlesin
4. Ben ve Hayrettin, AI modüllerinin JSON formatını netleştirelim

Kısa bir senkron toplantı ayarlayalım mı, yoksa buradan mı ilerleyelim?
```

---

## 8. Sonraki Adımlar (Şu An Buradayız)

1. ✅ Kütüphane ve mimari kararları alındı
2. ✅ Fonksiyonlar yazıldı
3. 🔜 **Sıradaki iş:** `extract_text` ve `detect_language` fonksiyonlarını
   gerçek bir PDF ile test etmek (Perplexity araştırmasından bağımsız, hemen
   yapılabilir)
4. 🔜 Perplexity prompt'unu çalıştırıp gerçek şartname/başlık bilgisini bulmak
5. 🔜 `mvp-rules.json`'ı gerçek veriyle güncellemek
6. 🔜 Örnek rapor seti oluşturmak/toplamak
7. 🔜 Grup mesajını atıp Mahmut/Mustafa onayını almak
8. 🔜 Hayrettin ile JSON format anlaşmasını resmileştirmek

---

## 9. İletişim Tercihleri (Claude Code için not)

- Kullanıcı bu alanda yeni — teknik terimleri gündelik örneklerle açıklamak
  gerekiyor (bu sohbette "havaalanı güvenlik kontrolü", "cevap anahtarı" gibi
  benzetmeler kullanıldı ve işe yaradı).
- Kararların sadece "ne" değil "neden" alındığını açıklamak isteniyor.
- Adım adım, aceleye getirilmeden ilerlemek tercih ediliyor.

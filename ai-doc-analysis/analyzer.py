import json
import sys
from pathlib import Path

import pdfplumber
from langdetect import detect, DetectorFactory

# langdetect kisa metinlerde her calistirmada farkli sonuc verebiliyor
# (rastgele bir tohum kullaniyor). Ayni PDF her seferinde ayni sonucu
# vermeli, bu yuzden tohumu sabitliyoruz.
DetectorFactory.seed = 0

DEFAULT_RULES_PATH = Path(__file__).resolve().parent.parent / "docs" / "mvp-rules.json"


def load_rules(rules_path: Path = DEFAULT_RULES_PATH) -> dict:
    with open(rules_path, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_text(pdf_path: str) -> str:
    """PDF'ten sayfa sayfa duz metin cikarir. Taranmis/goruntu PDF'lerde bos donebilir."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def count_pages(pdf_path: str) -> int:
    with pdfplumber.open(pdf_path) as pdf:
        return len(pdf.pages)


def detect_language(text: str) -> str:
    """Ilk 1000 karakterden dil tespiti yapar. Kisa/bozuk metinde 'unknown' doner."""
    sample = text[:1000].strip()
    if not sample:
        return "unknown"
    try:
        return detect(sample)
    except Exception:
        return "unknown"


def _turkish_casefold(s: str) -> str:
    """Python'un varsayilan .lower() metodu Turkce I/i, I/i harflerini yanlis
    esler (ornegin 'ILAC'.lower() -> 'ilac' degil 'ilac' olur ama 'Istanbul'
    gibi durumlarda 'i' ile 'i' karisir). Once Turkce harfleri ASCII'ye elle
    esitleyip sonra kucuk harfe ceviriyoruz; bu sayede hem basliktaki hem
    metindeki karsilastirma tutarli oluyor.
    """
    return s.replace("İ", "i").replace("I", "ı").lower()


def check_template(text: str, rules: dict) -> dict:
    """Zorunlu basliklarin metinde olup olmadigini kontrol eder (Turkce
    karakter farkliliklarina duyarli, buyuk/kucuk harf farki gozetmez)."""
    normalized_text = _turkish_casefold(text)
    eksik = [
        baslik
        for baslik in rules["zorunlu_basliklar"]
        if _turkish_casefold(baslik) not in normalized_text
    ]
    return {
        "sablon_uygun": len(eksik) == 0,
        "eksik_basliklar": eksik,
    }


def analyze_document(pdf_path: str, rules: dict) -> dict:
    """Ana giris noktasi - backend sadece bu fonksiyonu cagirir."""
    try:
        text = extract_text(pdf_path)
        if not text.strip():
            return {"hata": "PDF'ten metin cikarilamadi (taranmis/goruntu PDF olabilir)"}

        dil = detect_language(text)
        sablon = check_template(text, rules)

        return {
            "dil": dil,
            "sablon_uygun": sablon["sablon_uygun"],
            "eksik_basliklar": sablon["eksik_basliklar"],
            "hatalar": [],
        }
    except Exception as e:
        return {"hata": str(e)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanim: python analyzer.py <pdf_dosya_yolu>")
        sys.exit(1)

    rules = load_rules()
    result = analyze_document(sys.argv[1], rules)
    print(json.dumps(result, ensure_ascii=False, indent=2))

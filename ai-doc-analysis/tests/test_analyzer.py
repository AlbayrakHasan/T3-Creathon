"""Hafif, bagimsiz test scripti - pytest gerektirmez.
Calistirmak icin: python tests/test_analyzer.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from analyzer import check_template, detect_language, analyze_document, load_rules

passed = 0
failed = 0


def check(name, condition):
    global passed, failed
    if condition:
        print(f"PASS - {name}")
        passed += 1
    else:
        print(f"FAIL - {name}")
        failed += 1


rules = {"zorunlu_basliklar": ["Özet", "Problem Tanımı", "Yöntem", "Bulgular", "Sonuç"]}

# 1. Tum basliklar mevcutsa sablon uygun olmali
tam_metin = "ÖZET\n...\nPROBLEM TANIMI\n...\nYÖNTEM\n...\nBULGULAR\n...\nSONUÇ\n..."
sonuc = check_template(tam_metin, rules)
check("tum basliklar buyuk harfle yazilmis metinde bulunuyor", sonuc["sablon_uygun"] is True)

# 2. Bir baslik eksikse raporlanmali
eksik_metin = "Özet\n...\nProblem Tanımı\n...\nYöntem\n...\nBulgular\n..."
sonuc = check_template(eksik_metin, rules)
check("eksik baslik dogru tespit ediliyor", sonuc["eksik_basliklar"] == ["Sonuç"])

# 3. Turkce dotless-i / dotted-I uc durumu: "TANIMI" (buyuk, noktasiz I)
# vs rules'daki "Tanımı" (kucuk, noktasiz i) eslesmeli
buyuk_harf_metin = "ÖZET PROBLEM TANIMI YÖNTEM BULGULAR SONUÇ"
sonuc = check_template(buyuk_harf_metin, rules)
check("tamamen buyuk harfli Turkce metin dogru eslesiyor", sonuc["sablon_uygun"] is True)

# 4. Bos metinde dil tespiti 'unknown' donmeli, hata firlatmamali
check("bos metinde dil 'unknown' donuyor", detect_language("") == "unknown")
check("cok kisa/anlamsiz metinde de cokmuyor", detect_language("...") == "unknown" or isinstance(detect_language("..."), str))

# 5. Var olmayan dosya - analyze_document cokmemeli, 'hata' alaniyla donmeli
sonuc = analyze_document("olmayan_dosya.pdf", rules)
check("var olmayan dosyada 'hata' alani doner, exception firlamaz", "hata" in sonuc)

# 6. docs/mvp-rules.json gercekten okunabiliyor mu
gercek_rules = load_rules()
check("mvp-rules.json okunabiliyor ve zorunlu_basliklar iceriyor", "zorunlu_basliklar" in gercek_rules)

print(f"\n{passed} basarili, {failed} basarisiz")
sys.exit(1 if failed else 0)

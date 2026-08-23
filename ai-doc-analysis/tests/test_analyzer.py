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

# 7. Farkli yarismanin gercek raporlari (Saglikta YZ, PDR) - guncel kural seti
# artik Havacilikta YZ / KTR basliklarini iceriyor, bu yuzden bu raporlarin
# UYUMSUZ cikmasi beklenir (yanlis sablon kullanma senaryosunu test eder)
sample_dir = Path(__file__).resolve().parent.parent / "sample_reports"
for dosya in ["saglikta_yz_pdr_zebot-e1.pdf", "saglikta_yz_pdr_ckup.pdf"]:
    sonuc = analyze_document(str(sample_dir / dosya), gercek_rules)
    check(f"{dosya}: dil 'tr' tespit ediliyor", sonuc.get("dil") == "tr")
    check(f"{dosya}: farkli sablon oldugu icin sablon_uygun=False", sonuc.get("sablon_uygun") is False)

# 8. Havacilikta YZ / KTR - 34 gercek finalist raporundan orneklem (TEKNOFEST
# Derece Listesi'nden indirildi, bkz. sample_reports/havacilikta_yz_ktr/README.md)
ktr_dir = sample_dir / "havacilikta_yz_ktr" / "reports"

# Perplexity'nin dogrulama tablosunda "birebir" (tum basliklar uyumlu) olarak
# isaretlenen raporlar - kendi analyzer.py'mizle bagimsiz dogrulandi
for dosya in ["KTR_00_YXpGnt7IevOLKmM75xNlXyQlgHmz2bTM.pdf", "KTR_01_zrY5U4C9Q5AVFoTXPPQd6mkXHSI9dJhW.pdf"]:
    sonuc = analyze_document(str(ktr_dir / dosya), gercek_rules)
    check(f"{dosya}: sablon_uygun (tum basliklar birebir uyuyor)", sonuc.get("sablon_uygun") is True)

# "farkli_isim"/"yok" olarak isaretlenen raporlar - eksik baslik dogru yakalanmali
check_cases = {
    "KTR_04_5j08MAXDiofjTNfVPzwdaJow1BYgFOee.pdf": "Algoritmalar ve Sistem Mimarisi",
    "KTR_12_iG0MdwwmzU4g74omya3paxGSLfsqawqd.pdf": "Kaynakça",
}
for dosya, beklenen_eksik in check_cases.items():
    sonuc = analyze_document(str(ktr_dir / dosya), gercek_rules)
    check(
        f"{dosya}: '{beklenen_eksik}' eksik olarak yakalaniyor",
        beklenen_eksik in sonuc.get("eksik_basliklar", []),
    )

# KTR_13 gercekte Ingilizce yazilmis bir rapor - dil tespiti bunu yakalamali
sonuc = analyze_document(str(ktr_dir / "KTR_13_R1bVfdsapUpMaHHTj8runrvxXZPt1Mr4.pdf"), gercek_rules)
check("KTR_13: dil 'en' olarak tespit ediliyor (yanlis dil senaryosu)", sonuc.get("dil") == "en")

print(f"\n{passed} basarili, {failed} basarisiz")
sys.exit(1 if failed else 0)

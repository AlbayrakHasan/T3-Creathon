import datetime
import random
import sys
from pathlib import Path
from typing import List, Dict, Any

# Hasan's module (ai-doc-analysis) gercek kod olarak entegre edildi (2026-08-23).
# Hayrettin'in modulu henuz yazilmadigi icin evaluate_criteria/analyze_category_fit/
# check_similarity asagida hala mock - o gercek koda gecince ayni sekilde degisecek.

_AI_DOC_ANALYSIS_PATH = Path(__file__).resolve().parents[3] / "ai-doc-analysis"
if str(_AI_DOC_ANALYSIS_PATH) not in sys.path:
    sys.path.insert(0, str(_AI_DOC_ANALYSIS_PATH))

from analyzer import analyze_document_for_ui as _hasan_analyze_document  # noqa: E402


def analyze_document(file_path: str) -> Dict[str, Any]:
    """
    Hasan's Module: gercek dil/sablon/baslik/icerik kontrolu.

    ai-doc-analysis/analyzer.py -> analyze_document_for_ui() cagriliyor; o
    fonksiyon zaten bu backend'in bekledigi
    {"languageTemplate": {score, summary, findings}, "contentHeading": {...}}
    formatinda donuyor (bkz. docs/api-contract.md - "Gercek backend ile
    uyumsuzluk kesfedildi" notu). Kurallar (zorunlu basliklar, kabul edilen
    diller vb.) docs/mvp-rules.json'dan okunuyor; rules=None verilince
    analyzer kendi varsayilanini kullanir.
    """
    return _hasan_analyze_document(file_path)


def evaluate_criteria(file_path: str, criteria_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Hayrettin's Module Mock: Evaluates report against specific criteria rubrics.
    """
    is_good = "fail" not in file_path.lower() and "draft" not in file_path.lower()
    
    if is_good:
        return {
            "suggested_score": random.randint(82, 94),
            "suggested_outcome": "approve",
            "rationale": "Template compliance and originality are both strong. The only minor issue is a thin limitations section, which does not warrant a revision cycle."
        }
    elif "draft" in file_path.lower():
        return {
            "suggested_score": random.randint(55, 70),
            "suggested_outcome": "revise",
            "rationale": "Two mandatory headings are absent and self-overlap is above the comfort threshold. A revision cycle should resolve both."
        }
    else:
        return {
            "suggested_score": random.randint(35, 48),
            "suggested_outcome": "reject",
            "rationale": "Plagiarism/similarity is far above threshold and template was not used. Category fit is insufficient to advance."
        }

def analyze_category_fit(file_path: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Hayrettin's Module Mock: Computes alignment against possible categories.
    """
    # Select a category based on the file name or a default
    suggested_cat = "Robotics & Automation"
    for cat in categories:
        cat_name = cat.get("name", "")
        if cat_name.split()[0].lower() in file_path.lower():
            suggested_cat = cat_name
            break

    return {
        "score": random.randint(85, 96),
        "summary": f"Strongly aligned with the {suggested_cat} category.",
        "findings": [
            f"Core contribution fits {suggested_cat} requirements.",
            "Secondary sections do not shift or conflict with the category classification."
        ]
    }

def check_similarity(file_path: str, existing_reports_paths: List[str]) -> Dict[str, Any]:
    """
    Hayrettin's Module Mock: Checks similarity against the database of existing report files.
    """
    is_good = "plag" not in file_path.lower() and "fail" not in file_path.lower()
    
    if is_good:
        return {
            "score": random.randint(3, 12),
            "summary": "No meaningful overlap with prior submissions or public sources.",
            "findings": [
                "Highest single-source overlap is 3% and limited to standard definitions.",
                "No matches against the previous submission corpus."
            ]
        }
    else:
        return {
            "score": random.randint(45, 68),
            "summary": "High similarity overlap detected against prior submissions.",
            "findings": [
                "48% overlap with a publicly published whitepaper.",
                "12% overlap with a 2025 submission from a different team."
            ]
        }


def run_full_analysis(file_path: str, db_categories: List[Dict[str, Any]], existing_files: List[str], criteria_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Orchestrates the individual checks into a unified AiAnalysis payload.
    """
    doc_res = analyze_document(file_path)
    cat_res = analyze_category_fit(file_path, db_categories)
    sim_res = check_similarity(file_path, existing_files)
    eval_res = evaluate_criteria(file_path, criteria_list)
    
    return {
        "suggested_score": eval_res["suggested_score"],
        "suggested_outcome": eval_res["suggested_outcome"],
        "rationale": eval_res["rationale"],
        "language_template": doc_res["languageTemplate"],
        "content_heading": doc_res["contentHeading"],
        "category_match": cat_res,
        "similarity": sim_res
    }

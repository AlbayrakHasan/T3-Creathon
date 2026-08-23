import type { DecisionOutcome } from "./final-decision";

export const CHECK_KEYS = [
  "languageTemplate",
  "contentHeading",
  "categoryMatch",
  "similarity",
] as const;

export type AiCheckKey = (typeof CHECK_KEYS)[number];

/**
 * `positive` — a higher score is a better result (e.g. template match).
 * `negative` — a lower score is a better result (e.g. plagiarism similarity).
 */
export type CheckPolarity = "positive" | "negative";

export type CheckTone = "positive" | "caution" | "critical";

export interface AiCheckDefinition {
  key: AiCheckKey;
  label: string;
  /** Compact label used inside the confidence ring cards. */
  shortLabel: string;
  description: string;
  polarity: CheckPolarity;
}

export const CHECK_DEFINITIONS: Record<AiCheckKey, AiCheckDefinition> = {
  languageTemplate: {
    key: "languageTemplate",
    label: "Dil / Şablon Uyumu",
    shortLabel: "Dil ve Şablon",
    description:
      "Başvurunun gerekli rapor şablonuna, üsluba ve dil kurallarına ne kadar uyduğunu gösterir.",
    polarity: "positive",
  },
  contentHeading: {
    key: "contentHeading",
    label: "İçerik / Başlık Kontrolü",
    shortLabel: "İçerik ve Başlıklar",
    description:
      "Tüm zorunlu başlıkların bulunup bulunmadığını ve altlarında yeterli içerik olup olmadığını gösterir.",
    polarity: "positive",
  },
  categoryMatch: {
    key: "categoryMatch",
    label: "Kategori Uyumu",
    shortLabel: "Kategori Uyumu",
    description:
      "Projenin konusunun başvurulan kategoriyle ne kadar uyumlu olduğunu gösterir.",
    polarity: "positive",
  },
  similarity: {
    key: "similarity",
    label: "Benzerlik / İntihal",
    shortLabel: "Benzerlik",
    description:
      "Önceki başvurular ve kamuya açık kaynaklarla tespit edilen örtüşme oranı. Düşük olması daha iyidir.",
    polarity: "negative",
  },
};

export interface AiCheckResult {
  /** Confidence score from the evaluation engine, 0–100. */
  score: number;
  summary: string;
  findings: string[];
}

export type AiCheck = AiCheckDefinition & AiCheckResult;

export interface AiSuggestion {
  score: number;
  outcome: DecisionOutcome;
  rationale: string;
}

export interface AiAnalysis {
  reportId: string;
  analyzedAt: string;
  engineVersion: string;
  results: Record<AiCheckKey, AiCheckResult>;
  suggestion: AiSuggestion;
}

const POSITIVE_TONE_FLOOR = 85;
const CAUTION_TONE_FLOOR = 65;
const NEGATIVE_TONE_CEILING = 15;
const NEGATIVE_CAUTION_CEILING = 35;

/** Maps a raw score to a tone, respecting the check's polarity. */
export function getCheckTone(score: number, polarity: CheckPolarity): CheckTone {
  if (polarity === "negative") {
    if (score <= NEGATIVE_TONE_CEILING) return "positive";
    if (score <= NEGATIVE_CAUTION_CEILING) return "caution";
    return "critical";
  }
  if (score >= POSITIVE_TONE_FLOOR) return "positive";
  if (score >= CAUTION_TONE_FLOOR) return "caution";
  return "critical";
}

const TONE_LABELS: Record<CheckPolarity, Record<CheckTone, string>> = {
  positive: {
    positive: "Yüksek güven",
    caution: "Gözden geçirilmeli",
    critical: "Kritik",
  },
  negative: {
    positive: "Özgün",
    caution: "Gözden geçirilmeli",
    critical: "Yüksek risk",
  },
};

export function getToneLabel(score: number, polarity: CheckPolarity): string {
  return TONE_LABELS[polarity][getCheckTone(score, polarity)];
}

/** Expands a stored analysis into the ordered, display-ready list of checks. */
export function getChecks(analysis: AiAnalysis): AiCheck[] {
  return CHECK_KEYS.map((key) => ({
    ...CHECK_DEFINITIONS[key],
    ...analysis.results[key],
  }));
}

/**
 * Confidence the engine has in its own overall suggestion: the mean of every
 * check, with the negative-polarity checks flipped so 100 always means "good".
 */
export function getOverallConfidence(analysis: AiAnalysis): number {
  const total = CHECK_KEYS.reduce((sum, key) => {
    const { score } = analysis.results[key];
    const normalized =
      CHECK_DEFINITIONS[key].polarity === "negative" ? 100 - score : score;
    return sum + normalized;
  }, 0);
  return Math.round(total / CHECK_KEYS.length);
}

export const MOCK_ANALYSES: Record<string, AiAnalysis> = {
  "RPT-2026-013": {
    reportId: "RPT-2026-013",
    analyzedAt: "2026-08-17",
    engineVersion: "eval-engine v2.4",
    results: {
      languageTemplate: {
        score: 94,
        summary: "Resmi şablonu tutarlı bir akademik üslupla takip ediyor.",
        findings: [
          "6 şablon bölümünün tamamı gerekli sırada mevcut.",
          "Atıf stili yarışma kılavuzuyla (IEEE) uyumlu.",
          "İki şekil altyazısında numaralandırma eksik.",
        ],
      },
      contentHeading: {
        score: 88,
        summary: "Tüm zorunlu başlıklar mevcut ve içerik bakımından yeterli şekilde doldurulmuş.",
        findings: [
          "Özet, Yöntem, Bulgular ve Tartışma bölümlerinin tamamı minimum uzunluğu aşıyor.",
          "“Kısıtlamalar” bölümü mevcut ama 100 kelimenin altında.",
        ],
      },
      categoryMatch: {
        score: 91,
        summary: "Yapay Zeka ve Makine Öğrenmesi kategorisiyle güçlü şekilde uyumlu.",
        findings: [
          "Ana katkı, transformer tabanlı bir hareket tanıma modeli.",
          "Donanım tartışması ikincil düzeyde ve kategoriyi değiştirmiyor.",
        ],
      },
      similarity: {
        score: 8,
        summary: "Önceki başvurular veya kamuya açık kaynaklarla anlamlı bir örtüşme yok.",
        findings: [
          "En yüksek tekil kaynak örtüşmesi %3 ve standart tanımlarla sınırlı.",
          "2025 başvuru havuzuyla eşleşme bulunamadı.",
        ],
      },
    },
    suggestion: {
      score: 88,
      outcome: "approve",
      rationale:
        "Şablon uyumu ve özgünlük her ikisi de güçlü. Tek zayıf nokta, revizyon turu gerektirmeyecek kadar ince olan Kısıtlamalar bölümü.",
    },
  },
  "RPT-2026-011": {
    reportId: "RPT-2026-011",
    analyzedAt: "2026-08-15",
    engineVersion: "eval-engine v2.4",
    results: {
      languageTemplate: {
        score: 72,
        summary: "Şablon genel olarak takip edilmiş, ancak ilerleyen bölümlerde biçim kayması var.",
        findings: [
          "Ek bölümünde onaylanmamış iki sütunlu bir yerleşim kullanılmış.",
          "3. ve 5. bölümler arasında karışık atıf stilleri var.",
          "Sonuç bölümünde üslup pazarlama diline kayıyor.",
        ],
      },
      contentHeading: {
        score: 61,
        summary: "Başvuruda iki zorunlu başlık eksik.",
        findings: [
          "“Risk Değerlendirmesi” başlığı bulunamadı.",
          "“Veri Kaynakları” başlığı bulunamadı.",
          "Bulgular bölümü, aslında Tartışma altında olması gereken içerik barındırıyor.",
        ],
      },
      categoryMatch: {
        score: 86,
        summary: "Finans Teknolojisi kategorisine uyuyor, kısmi düzenleyici/politika örtüşmesi var.",
        findings: [
          "Mikro kredi mekanikleri ana katkıyı oluşturuyor.",
          "Raporun üçte biri teknolojiden çok uyumluluk konularını ele alıyor.",
        ],
      },
      similarity: {
        score: 28,
        summary: "Takımın kendi önceki teknik raporuyla orta düzeyde örtüşme tespit edildi.",
        findings: [
          "Aynı yazarlara ait, kamuya açık yayınlanmış bir teknik raporla %22 örtüşme.",
          "Standart düzenleyici kalıp metinlerle %6 örtüşme.",
        ],
      },
    },
    suggestion: {
      score: 64,
      outcome: "revise",
      rationale:
        "İki zorunlu başlık eksik ve kendi kendine örtüşme kabul edilebilir eşiğin üzerinde. Bir revizyon turu, sağlam bir konsepti cezalandırmadan her ikisini de çözebilir.",
    },
  },
  "RPT-2026-009": {
    reportId: "RPT-2026-009",
    analyzedAt: "2026-08-12",
    engineVersion: "eval-engine v2.4",
    results: {
      languageTemplate: {
        score: 58,
        summary: "Gerekli şablon yapısından ciddi bir sapma var.",
        findings: [
          "Rapor, değerlendirme şablonu yerine bir tasarım belgesi olarak sunulmuş.",
          "Özet bölümü bulunmuyor.",
          "Bölüm numaralandırması kılavuzla uyuşmuyor.",
        ],
      },
      contentHeading: {
        score: 49,
        summary: "Zorunlu başlıkların yarısından azı bulunabildi.",
        findings: [
          "Yalnızca “Giriş” ve “Bulgular” zorunlu setle eşleşti.",
          "Yöntem içeriği, başlıksız düz metin içine dağılmış durumda.",
        ],
      },
      categoryMatch: {
        score: 93,
        summary: "Tartışmasız bir şekilde Oyun Tasarımı başvurusu.",
        findings: [
          "Prosedürel üretim ve seviye temposu ana konuları oluşturuyor.",
          "Farklı bir kategoriye işaret eden içerik yok.",
        ],
      },
      similarity: {
        score: 47,
        summary: "Yaygın olarak dolaşan bir eğitim serisiyle yüksek örtüşme var.",
        findings: [
          "Kamuya açık bir prosedürel üretim eğitim seriyle %38 örtüşme.",
          "Farklı bir takımın 2025 başvurusuyla %9 örtüşme.",
        ],
      },
    },
    suggestion: {
      score: 41,
      outcome: "reject",
      rationale:
        "Benzerlik eşiğin çok üzerinde ve şablon kullanılmamış. Kategori uyumu tek başına başvurunun ilerlemesi için yeterli değil.",
    },
  },
};

export function getMockAnalysis(reportId: string): AiAnalysis | null {
  return MOCK_ANALYSES[reportId] ?? null;
}

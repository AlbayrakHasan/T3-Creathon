export type ReportStatus = "pending" | "analyzed";

export interface EvaluationReport {
  reportId: string;
  projectName: string;
  category: string;
  status: ReportStatus;
  submissionDate: string;
}

export const MOCK_REPORTS: EvaluationReport[] = [
  {
    reportId: "RPT-2026-014",
    projectName: "Autonomous Crop Monitoring Drone",
    category: "Robotik ve Otomasyon",
    status: "pending",
    submissionDate: "2026-08-18",
  },
  {
    reportId: "RPT-2026-013",
    projectName: "NeuroLingua — Real-Time Sign Language Translator",
    category: "Yapay Zeka ve Makine Öğrenmesi",
    status: "analyzed",
    submissionDate: "2026-08-17",
  },
  {
    reportId: "RPT-2026-012",
    projectName: "MicroGrid Load Balancer",
    category: "Sürdürülebilirlik ve Enerji",
    status: "pending",
    submissionDate: "2026-08-16",
  },
  {
    reportId: "RPT-2026-011",
    projectName: "ClarityLedger — Transparent Micro-Lending Platform",
    category: "Finans Teknolojisi",
    status: "analyzed",
    submissionDate: "2026-08-15",
  },
  {
    reportId: "RPT-2026-010",
    projectName: "VitalSense Remote Patient Monitor",
    category: "Sağlık Teknolojisi",
    status: "pending",
    submissionDate: "2026-08-14",
  },
  {
    reportId: "RPT-2026-009",
    projectName: "Pathfinder — Procedural Level Generator",
    category: "Oyun Tasarımı",
    status: "analyzed",
    submissionDate: "2026-08-12",
  },
];

export function getMockReports(): EvaluationReport[] {
  return MOCK_REPORTS;
}

export function getMockReportById(reportId: string): EvaluationReport | null {
  return MOCK_REPORTS.find((report) => report.reportId === reportId) ?? null;
}

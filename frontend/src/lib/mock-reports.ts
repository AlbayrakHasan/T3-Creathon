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
    category: "Robotics & Automation",
    status: "pending",
    submissionDate: "2026-08-18",
  },
  {
    reportId: "RPT-2026-013",
    projectName: "NeuroLingua — Real-Time Sign Language Translator",
    category: "AI & Machine Learning",
    status: "analyzed",
    submissionDate: "2026-08-17",
  },
  {
    reportId: "RPT-2026-012",
    projectName: "MicroGrid Load Balancer",
    category: "Sustainability & Energy",
    status: "pending",
    submissionDate: "2026-08-16",
  },
  {
    reportId: "RPT-2026-011",
    projectName: "ClarityLedger — Transparent Micro-Lending Platform",
    category: "FinTech",
    status: "analyzed",
    submissionDate: "2026-08-15",
  },
  {
    reportId: "RPT-2026-010",
    projectName: "VitalSense Remote Patient Monitor",
    category: "HealthTech",
    status: "pending",
    submissionDate: "2026-08-14",
  },
  {
    reportId: "RPT-2026-009",
    projectName: "Pathfinder — Procedural Level Generator",
    category: "Game Design",
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

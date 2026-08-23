import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGuard } from "@/components/role-guard";
import { RefereeReportDetail } from "@/components/referee/referee-report-detail";
import { getMockAnalysis } from "@/lib/ai-analysis";
import { getMockReportById, MOCK_REPORTS } from "@/lib/mock-reports";

export function generateStaticParams() {
  return MOCK_REPORTS.map((report) => ({ id: report.reportId }));
}

export default async function RefereeReportPage(
  props: PageProps<"/dashboard/referee/[id]">,
) {
  const { id } = await props.params;
  const report = getMockReportById(id);

  if (!report) {
    notFound();
  }

  return (
    <RoleGuard requiredRole="REFEREE">
      <DashboardShell role="REFEREE">
        <RefereeReportDetail report={report} analysis={getMockAnalysis(id)} />
      </DashboardShell>
    </RoleGuard>
  );
}

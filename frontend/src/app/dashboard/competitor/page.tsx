import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGuard } from "@/components/role-guard";
import { CompetitorDashboard } from "@/components/competitor/competitor-dashboard";

export default function CompetitorDashboardPage() {
  return (
    <RoleGuard requiredRole="COMPETITOR">
      <DashboardShell role="COMPETITOR">
        <CompetitorDashboard />
      </DashboardShell>
    </RoleGuard>
  );
}

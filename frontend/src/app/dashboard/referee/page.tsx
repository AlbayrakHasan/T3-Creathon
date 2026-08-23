import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGuard } from "@/components/role-guard";
import { RefereeDashboard } from "@/components/referee/referee-dashboard";

export default function RefereeDashboardPage() {
  return (
    <RoleGuard requiredRole="REFEREE">
      <DashboardShell role="REFEREE">
        <RefereeDashboard />
      </DashboardShell>
    </RoleGuard>
  );
}

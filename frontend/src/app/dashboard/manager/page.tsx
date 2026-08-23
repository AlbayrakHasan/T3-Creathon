import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGuard } from "@/components/role-guard";
import { ManagerDashboard } from "@/components/manager/manager-dashboard";

export default function CompetitionManagerDashboard() {
  return (
    <RoleGuard requiredRole="COMPETITION_MANAGER">
      <DashboardShell role="COMPETITION_MANAGER">
        <ManagerDashboard />
      </DashboardShell>
    </RoleGuard>
  );
}

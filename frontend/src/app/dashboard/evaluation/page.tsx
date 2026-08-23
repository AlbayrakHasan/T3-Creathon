import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGuard } from "@/components/role-guard";

export default function EvaluationManagerDashboard() {
  return (
    <RoleGuard requiredRole="EVALUATION_MANAGER">
      <DashboardShell role="EVALUATION_MANAGER">
        <p className="text-sm text-muted">
          Configure AI-assisted evaluation rubrics and review outcomes.
        </p>
      </DashboardShell>
    </RoleGuard>
  );
}

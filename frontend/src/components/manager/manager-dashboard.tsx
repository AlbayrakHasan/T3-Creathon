"use client";

import { CriteriaTemplateForm } from "./criteria-template-form";
import { ReportUpload } from "./report-upload";

export function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Competition Setup</h2>
        <p className="mt-1 text-sm text-muted">
          Define evaluation criteria templates and manage incoming report submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <CriteriaTemplateForm />
        <ReportUpload />
      </div>
    </div>
  );
}

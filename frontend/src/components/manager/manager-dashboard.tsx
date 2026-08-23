"use client";

import { CriteriaTemplateForm } from "./criteria-template-form";
import { ReportUpload } from "./report-upload";

export function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Yarışma Kurulumu</h2>
        <p className="mt-1 text-sm text-muted">
          Değerlendirme kriter şablonlarını tanımlayın ve gelen rapor başvurularını yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <CriteriaTemplateForm />
        <ReportUpload />
      </div>
    </div>
  );
}

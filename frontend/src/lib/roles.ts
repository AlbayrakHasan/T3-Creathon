export const ROLES = [
  "COMPETITION_MANAGER",
  "REFEREE",
  "COMPETITOR",
  "EVALUATION_MANAGER",
] as const;

export type Role = (typeof ROLES)[number];

export interface RoleDefinition {
  role: Role;
  label: string;
  description: string;
  dashboardPath: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  COMPETITION_MANAGER: {
    role: "COMPETITION_MANAGER",
    label: "Yarışma Yöneticisi",
    description: "Yarışmaları, takvimleri ve genel etkinlik yapılandırmasını yönetir.",
    dashboardPath: "/dashboard/manager",
  },
  REFEREE: {
    role: "REFEREE",
    label: "Hakem/Değerlendirici",
    description: "Canlı performansları puanlar ve yarışma kurallarını uygular.",
    dashboardPath: "/dashboard/referee",
  },
  COMPETITOR: {
    role: "COMPETITOR",
    label: "Yarışmacı",
    description: "Takvimleri, başvuruları ve kişisel sonuçları görüntüler.",
    dashboardPath: "/dashboard/competitor",
  },
  EVALUATION_MANAGER: {
    role: "EVALUATION_MANAGER",
    label: "Değerlendirme Yöneticisi",
    description: "AI destekli değerlendirme rubriklerini yapılandırır ve sonuçları inceler.",
    dashboardPath: "/dashboard/evaluation",
  },
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function getDashboardPath(role: Role): string {
  return ROLE_DEFINITIONS[role].dashboardPath;
}

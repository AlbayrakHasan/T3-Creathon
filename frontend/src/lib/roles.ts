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
    label: "Competition Manager",
    description: "Oversee competitions, schedules, and overall event configuration.",
    dashboardPath: "/dashboard/manager",
  },
  REFEREE: {
    role: "REFEREE",
    label: "Referee",
    description: "Score live performances and enforce competition rules.",
    dashboardPath: "/dashboard/referee",
  },
  COMPETITOR: {
    role: "COMPETITOR",
    label: "Competitor",
    description: "View schedules, submissions, and personal results.",
    dashboardPath: "/dashboard/competitor",
  },
  EVALUATION_MANAGER: {
    role: "EVALUATION_MANAGER",
    label: "Evaluation Manager",
    description: "Configure AI-assisted evaluation rubrics and review outcomes.",
    dashboardPath: "/dashboard/evaluation",
  },
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function getDashboardPath(role: Role): string {
  return ROLE_DEFINITIONS[role].dashboardPath;
}

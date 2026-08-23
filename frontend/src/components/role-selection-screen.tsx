"use client";

import { useRouter } from "next/navigation";
import { ROLE_DEFINITIONS, ROLES, getDashboardPath, type Role } from "@/lib/roles";
import { useAuthStore } from "@/store/auth-store";

const ROLE_ICON_PATHS: Record<Role, string> = {
  COMPETITION_MANAGER:
    "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Zm9-1.7L5.5 9v6L12 18.2 18.5 15V9L12 5.8Z",
  REFEREE: "M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Zm0 9.5 3 1.7-.8-3.4 2.6-2.3-3.5-.3L12 4l-1.3 3.2-3.5.3 2.6 2.3-.8 3.4L12 11.5Z",
  COMPETITOR: "M12 2a5 5 0 0 1 5 5c0 2.2-1.4 4-3.3 4.7L15 21H9l1.3-9.3C8.4 11 7 9.2 7 7a5 5 0 0 1 5-5Z",
  EVALUATION_MANAGER:
    "M4 4h16v3H4V4Zm0 6.5h10v3H4v-3ZM4 17h16v3H4v-3Zm13-6.5h3v3h-3v-3Z",
};

export function RoleSelectionScreen() {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.setRole);

  function handleSelectRole(role: Role) {
    setRole(role);
    router.push(getDashboardPath(role));
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            AI Destekli Değerlendirme Sistemi
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Devam etmek için giriş yapın
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Kendi çalışma alanınıza erişmek için rolünüzü seçin.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Rolünüzü seçin"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {ROLES.map((role) => {
            const definition = ROLE_DEFINITIONS[role];
            return (
              <button
                key={role}
                type="button"
                role="radio"
                aria-checked="false"
                data-testid={`role-card-${role}`}
                onClick={() => handleSelectRole(role)}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d={ROLE_ICON_PATHS[role]} />
                  </svg>
                </span>
                <span className="text-base font-bold text-foreground">
                  {definition.label}
                </span>
                <span className="text-sm leading-relaxed text-muted">
                  {definition.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

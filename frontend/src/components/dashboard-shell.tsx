"use client";

import { useRouter } from "next/navigation";
import { ROLE_DEFINITIONS, type Role } from "@/lib/roles";
import { useAuthStore } from "@/store/auth-store";

interface DashboardShellProps {
  role: Role;
  children: React.ReactNode;
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const definition = ROLE_DEFINITIONS[role];

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              AI Destekli Değerlendirme Sistemi
            </p>
            <h1 className="text-lg font-bold text-foreground">{definition.label} Paneli</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Çıkış yap
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}

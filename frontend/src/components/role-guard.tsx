"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, type Role } from "@/lib/roles";
import { useAuthStore } from "@/store/auth-store";

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (role === null) {
      router.replace("/");
      return;
    }
    if (role !== requiredRole) {
      router.replace(getDashboardPath(role));
    }
  }, [role, requiredRole, router]);

  if (role === null || role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requirePageUser } from "@/features/auth/current-user";

export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requirePageUser();
  return <AppShell>{children}</AppShell>;
}


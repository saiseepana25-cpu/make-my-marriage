import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <><Header /><main id="main-content" className="mx-auto max-w-xl px-6 py-12">{children}</main></>;
}


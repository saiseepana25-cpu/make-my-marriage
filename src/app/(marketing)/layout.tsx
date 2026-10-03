import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <><Header /><main id="main-content"><PageContainer>{children}</PageContainer></main></>;
}


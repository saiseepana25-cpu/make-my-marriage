import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

export default function WeddingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-border px-6 py-5 text-primary">Make My Marriage</header>
      <main id="main-content"><PageContainer>{children}</PageContainer></main>
    </>
  );
}


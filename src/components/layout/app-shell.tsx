import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        <Sidebar />
        <main id="main-content" className="min-w-0 flex-1">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </>
  );
}


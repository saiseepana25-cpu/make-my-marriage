import type { ReactNode } from "react";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="landing-page">
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="min-h-screen w-full pt-20">{children}</main>
      <LandingFooter />
    </div>
  );
}

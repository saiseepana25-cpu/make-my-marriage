import type { ReactNode } from "react";
import localFont from "next/font/local";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";

const manrope = localFont({
  src: "../../assets/fonts/manrope.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

const playfair = localFont({
  src: [
    { path: "../../assets/fonts/playfair-display.ttf", weight: "400 900", style: "normal" },
    { path: "../../assets/fonts/playfair-display-italic.ttf", weight: "400 900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${manrope.variable} ${playfair.variable} landing-page`}>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="min-h-screen w-full pt-20">{children}</main>
      <LandingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { WorkspaceNavigationProvider } from "@/components/layout/workspace-navigation";
import "./globals.css";

const manrope = localFont({ src: "../assets/fonts/manrope.ttf", variable: "--font-manrope", weight: "200 800", display: "swap" });
const playfair = localFont({
  src: [
    { path: "../assets/fonts/playfair-display.ttf", weight: "400 900", style: "normal" },
    { path: "../assets/fonts/playfair-display-italic.ttf", weight: "400 900", style: "italic" },
  ], variable: "--font-playfair", display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Make My Marriage", template: "%s | Make My Marriage" },
  description: "Wedding planning and collaboration for Indian families.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} app-theme min-h-screen bg-background text-foreground antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:p-4">Skip to content</a>
        <WorkspaceNavigationProvider>{children}</WorkspaceNavigationProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Hero, ProductPromise, ScatteredPlanning } from "@/components/marketing/landing-introduction";
import { FamilyPreview, ActivityPreview, BudgetPreview, GuestPreview, DashboardPreview } from "@/components/marketing/landing-previews";
import { WeddingJourney, WeddingMemories, HowItWorks, PlanningPrivacy, WeddingSuite, FinalInvitation } from "@/components/marketing/landing-story";
import { LandingFaq } from "@/components/marketing/landing-faq";

export const metadata: Metadata = {
  title: { absolute: "Make My Marriage — Plan your wedding together" },
  description: "Plan your Indian wedding with your family. Organize events, tasks, guests, expenses, photos, and your wedding website in one shared workspace.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductPromise />
      <ScatteredPlanning />
      <FamilyPreview />
      <ActivityPreview />
      <BudgetPreview />
      <GuestPreview />
      <DashboardPreview />
      <WeddingJourney />
      <WeddingMemories />
      <HowItWorks />
      <PlanningPrivacy />
      <WeddingSuite />
      <LandingFaq />
      <FinalInvitation />
    </>
  );
}

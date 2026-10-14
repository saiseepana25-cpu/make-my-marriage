import type { Metadata } from "next";
import { WebsiteWorkspace } from "@/components/website/website-workspace";
import { requirePageUser } from "@/features/auth/current-user";
import { websiteOrigin } from "@/features/website/format";

export const metadata: Metadata = { title: "Wedding Website", robots: { index: false, follow: false } };

export default async function Page() {
  const user = await requirePageUser();
  const origin = websiteOrigin(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", process.env.NODE_ENV === "production");
  return <WebsiteWorkspace role={user.role} origin={origin} />;
}

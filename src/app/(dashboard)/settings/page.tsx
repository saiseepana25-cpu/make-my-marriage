import { WeddingSettings } from "@/components/weddings/wedding-settings";
import { requirePageUser } from "@/features/auth/current-user";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wedding Settings" };

export default async function Page() {
  const user = await requirePageUser();
  return <WeddingSettings role={user.role} />;
}

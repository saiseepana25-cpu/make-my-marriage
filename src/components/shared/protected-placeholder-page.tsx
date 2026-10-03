import { requirePageUser } from "@/features/auth/current-user";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export async function ProtectedPlaceholderPage({ title, description }: { title: string; description: string }) {
  // Guard the leaf too: layouts alone do not secure all Next.js entry points.
  await requirePageUser();
  return <PlaceholderPage title={title} description={description} />;
}


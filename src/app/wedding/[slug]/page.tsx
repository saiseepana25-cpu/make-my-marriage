import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default async function PublicWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlaceholderPage title="Wedding website" description={`A public wedding page for ${slug}. Wedding details will appear here when available.`} />;
}


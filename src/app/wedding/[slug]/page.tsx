import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWeddingContent } from "@/components/website/public-wedding";
import { loadPublicWeddingPage } from "@/features/website/service";
import { AppError } from "@/lib/api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wedding celebration", robots: { index: false, follow: false } };

export default async function PublicWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadPublicWeddingPage(slug).catch(error => {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  return <PublicWeddingContent {...data} />;
}

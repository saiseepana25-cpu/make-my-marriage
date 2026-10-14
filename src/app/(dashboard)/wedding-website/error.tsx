"use client";
import { websitePrimary } from "@/components/website/website-ui";
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div role="alert" className="rounded-3xl bg-surface-container-lowest p-8 text-center"><h1 className="font-display-md text-3xl text-primary">Couldn’t load wedding website</h1><p className="mt-4 text-sm text-secondary">Please try again to load the sharing page.</p><button type="button" className={`${websitePrimary} mt-6`} onClick={retry}>Retry</button></div>;
}

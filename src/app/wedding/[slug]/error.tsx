"use client";
import { websitePrimary } from "@/components/website/website-ui";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div role="alert" className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="font-display-md text-3xl text-primary">Couldn’t load this wedding website</h1><p className="mt-4 text-sm leading-relaxed text-secondary">Please try again in a moment.</p><button type="button" className={`${websitePrimary} mt-6`} onClick={retry}>Retry</button></div>;
}

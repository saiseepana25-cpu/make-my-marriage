export default function Loading() {
  return <div role="status" aria-live="polite" className="space-y-6"><p className="text-on-surface-variant">Loading wedding events…</p>
    <div aria-hidden="true" className="h-12 w-60 animate-pulse rounded-xl bg-surface-container" />
    {[1, 2, 3].map(key => <div key={key} aria-hidden="true" className="h-40 animate-pulse rounded-2xl bg-surface-container-lowest shadow-sm" />)}
  </div>;
}

import type { ReactNode } from "react";

export function PlaceholderPage({
  title, description, children,
}: { title: string; description: string; children?: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 sm:p-10">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}


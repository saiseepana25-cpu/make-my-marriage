import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-surface px-6 py-5">
      <Link href="/" className="font-semibold tracking-tight text-primary">
        Make My Marriage
      </Link>
    </header>
  );
}


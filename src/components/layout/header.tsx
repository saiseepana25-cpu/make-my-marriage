import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/auth/logout-button";

export function Header({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <header className="flex min-h-20 items-center justify-between gap-3 border-b border-outline-variant/40 bg-surface px-5 py-4 sm:px-8">
      <Link href="/" className="flex items-center gap-2 whitespace-nowrap font-display-md text-[15px] font-semibold tracking-tight text-primary sm:text-[17px]">
        <Image src="/images/landing/brand.png" alt="" width={32} height={32} className="size-6 shrink-0 sm:size-8" />Make My Marriage
      </Link>
      {authenticated && <LogoutButton />}
    </header>
  );
}

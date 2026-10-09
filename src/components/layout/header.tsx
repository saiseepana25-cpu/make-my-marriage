import { WorkspaceLink as Link } from "./workspace-navigation";
import Image from "next/image";
import { LogoutButton } from "@/components/auth/logout-button";

export function Header({ authenticated = false, couple }: { authenticated?: boolean; couple?: string }) {
  return (
    <header className={`flex min-h-20 items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface/95 px-5 py-4 backdrop-blur-lg sm:px-8 ${authenticated ? "pl-16 sm:pl-16 lg:pl-10" : ""}`}>
      <Link href="/" className="flex items-center gap-2 whitespace-nowrap font-display-md text-[15px] font-semibold tracking-tight text-primary sm:text-[17px]">
        <Image src="/images/landing/brand.png" alt="" width={32} height={32} className="size-6 shrink-0 sm:size-8" />Make My Marriage
      </Link>
      {couple && <span className="hidden min-w-0 max-w-64 truncate rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container xl:block">{couple}</span>}
      {authenticated && <LogoutButton />}
    </header>
  );
}

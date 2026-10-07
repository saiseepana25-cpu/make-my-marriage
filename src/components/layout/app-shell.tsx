import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requirePageUser } from "@/features/auth/current-user";
import { getCurrentWedding } from "@/features/weddings/service";

export async function AppShell({ children }: { children: ReactNode }) {
  const [user, wedding] = await Promise.all([requirePageUser(), getCurrentWedding()]);
  const couple = `${wedding.groomName} & ${wedding.brideName}`;
  const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(wedding.weddingDate));
  return (
    <>
      <Sidebar couple={couple} date={date} user={user} />
      <div className="min-h-screen lg:pl-72">
        <div className="sticky top-0 z-20"><Header authenticated couple={couple} /></div>
        <main id="main-content" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-[1440px] px-5 py-7 pb-28 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </>
  );
}

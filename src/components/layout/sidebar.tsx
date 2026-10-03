import Link from "next/link";
import { dashboardNavigation } from "@/config/navigation";

export function Sidebar() {
  return (
    <nav aria-label="Wedding workspace" className="border-b border-border p-4 md:w-56 md:shrink-0 md:border-r md:border-b-0">
      <ul className="flex flex-wrap gap-1 md:flex-col">
        {dashboardNavigation.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="block rounded-md px-3 py-2 text-sm hover:bg-surface hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}


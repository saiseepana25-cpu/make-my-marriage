import Link from "next/link";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function HomePage() {
  return (
    <PlaceholderPage title="Make My Marriage" description="Everything your family needs to organize the wedding, together, in one place.">
      <Link href="/login" className="inline-block rounded-md bg-primary px-5 py-3 font-medium text-white hover:bg-primary-hover">
        Log in
      </Link>
    </PlaceholderPage>
  );
}


import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { activityCard, primaryAction } from "./activity-ui";
export function ActivityFailure({ expired, retry, label = "activities" }: { expired: boolean; retry: () => void; label?: string }) {
  return <div role="alert" className={`${activityCard} text-center`}><Icon name="warning" className="text-3xl text-primary" /><h2 className="mt-3 text-xl font-semibold">Couldn’t load {label}</h2><p className="mt-3 text-sm text-secondary">{expired ? "Your session has expired. Please log in again." : "Your saved updates have not been changed. Please try again."}</p>{expired ? <Link href="/login" className={`${primaryAction} mt-5`}>Log in</Link> : <button type="button" onClick={retry} className={`${primaryAction} mt-5`}>Retry {label}</button>}</div>;
}

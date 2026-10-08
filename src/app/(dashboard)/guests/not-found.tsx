import { BackToGuests, guestCard } from "@/components/guests/guest-ui";
export default function NotFound() { return <div className={`${guestCard} text-center`}><h1 className="font-display-md text-3xl text-primary">Guest unavailable</h1><p className="my-5 text-sm text-secondary">This guest record is no longer available in your wedding workspace.</p><BackToGuests /></div>; }

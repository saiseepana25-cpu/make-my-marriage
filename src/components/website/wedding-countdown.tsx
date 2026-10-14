"use client";
import { useEffect, useState } from "react";
import { guestCountdown } from "@/features/website/format";

export function WeddingCountdown({ weddingDate, asOf }: { weddingDate: string; asOf: number }) {
  const [now, setNow] = useState(asOf);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  return <span>{guestCountdown(weddingDate, now)}</span>;
}

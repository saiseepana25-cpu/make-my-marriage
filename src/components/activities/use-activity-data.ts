"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse } from "@/types/api";
type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; expired: boolean };
export function useActivityData<T>(url: string) {
  const [snapshot, setSnapshot] = useState<{ url: string; state: Load<T>; previous?: T }>({ url, state: { status: "loading" } });
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    controller.current?.abort(); const next = new AbortController(); controller.current = next;
    void (async () => {
      try {
        const response = await fetch(url, { cache: "no-store", credentials: "same-origin", signal: next.signal });
        const result = await response.json() as ApiResponse<T>;
        if (!next.signal.aborted) setSnapshot(old => ({ url, previous: old.state.status === "ready" ? old.state.data : old.previous, state: response.ok && result.success ? { status: "ready", data: result.data } : { status: "error", expired: response.status === 401 } }));
      } catch { if (!next.signal.aborted) setSnapshot(old => ({ url, previous: old.state.status === "ready" ? old.state.data : old.previous, state: { status: "error", expired: false } })); }
    })();
  }, [url]);
  const reload = useCallback(() => { setSnapshot(old => ({ url, state: { status: "loading" }, previous: old.state.status === "ready" ? old.state.data : old.previous })); load(); }, [url, load]);
  useEffect(() => { load(); return () => controller.current?.abort(); }, [load]);
  return { state: snapshot.url === url ? snapshot.state : { status: "loading" } as Load<T>, reload, lastData: snapshot.state.status === "ready" ? snapshot.state.data : snapshot.previous };
}

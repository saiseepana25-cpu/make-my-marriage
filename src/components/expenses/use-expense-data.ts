"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse } from "@/types/api";
export type ExpenseLoad<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string; expired: boolean };
export function useExpenseData<T>(url: string) {
  const [state, setState] = useState<ExpenseLoad<T>>({ status: "loading" });
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    controller.current?.abort();
    const next = new AbortController(); controller.current = next;
    void (async () => {
      try {
        const response = await fetch(url, { cache: "no-store", credentials: "same-origin", signal: next.signal });
        const result = await response.json() as ApiResponse<T>;
        if (next.signal.aborted) return;
        setState(response.ok && result.success ? { status: "ready", data: result.data } : { status: "error", expired: response.status === 401, message: result.message || "Could not load your saved data." });
      } catch { if (!next.signal.aborted) setState({ status: "error", expired: false, message: "Check your connection and try again." }); }
    })();
  }, [url]);
  const reload = useCallback(() => { setState({ status: "loading" }); load(); }, [load]);
  useEffect(() => { load(); return () => controller.current?.abort(); }, [load]);
  return { state, reload };
}

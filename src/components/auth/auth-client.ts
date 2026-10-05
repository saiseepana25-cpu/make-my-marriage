"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const yes = () => true;
const no = () => false;

export function useAuthReady() { return useSyncExternalStore(subscribe, yes, no); }

export async function postAuth(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    const detail = result.error?.details?.[0];
    throw new Error(typeof detail === "string" ? detail : result.message || "Please try again.");
  }
}

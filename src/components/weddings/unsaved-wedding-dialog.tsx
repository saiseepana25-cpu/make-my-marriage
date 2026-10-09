"use client";
import { useCallback, useEffect, useRef } from "react";
import { useWorkspaceNavigation } from "@/components/layout/workspace-navigation";

type HistoryNavigation = EventTarget & { traverseTo: (key: string) => { finished: Promise<unknown> } };
type HistoryNavigateEvent = Event & { navigationType: string; destination: { key: string } };

export function UnsavedWeddingDialog({ dirty, saving, onDiscard }: { dirty: boolean; saving: boolean; onDiscard: () => void }) {
  const navigation = useWorkspaceNavigation();
  const dialog = useRef<HTMLDialogElement>(null), keep = useRef<HTMLButtonElement>(null);
  const action = useRef<(() => void) | null>(null), previousFocus = useRef<HTMLElement | null>(null), bypass = useRef(false);
  const block = useCallback((proceed: () => void) => {
    if (bypass.current) return false;
    if (saving) return true;
    if (!dirty) return false;
    action.current = proceed; previousFocus.current = document.activeElement as HTMLElement;
    dialog.current?.showModal(); keep.current?.focus(); return true;
  }, [dirty, saving]);
  useEffect(() => navigation.register(block), [navigation, block]);
  useEffect(() => {
    if (!dirty && !saving) { bypass.current = false; return; }
    const unload = (event: BeforeUnloadEvent) => { if (!bypass.current) { event.preventDefault(); event.returnValue = ""; } };
    const browserNavigation = (window as Window & { navigation?: HistoryNavigation }).navigation;
    const traverse = (event: Event) => {
      const change = event as HistoryNavigateEvent;
      if (bypass.current || change.navigationType !== "traverse" || !change.cancelable) return;
      const proceed = () => { bypass.current = true; void browserNavigation?.traverseTo(change.destination.key).finished.catch(() => { bypass.current = false; }); };
      if (block(proceed)) change.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    if (browserNavigation) browserNavigation.addEventListener("navigate", traverse);
    return () => { window.removeEventListener("beforeunload", unload); browserNavigation?.removeEventListener("navigate", traverse); };
  }, [dirty, saving, block]);
  return <dialog ref={dialog} aria-labelledby="discard-wedding-title" aria-describedby="discard-wedding-description"
    onClose={() => { if (!bypass.current) previousFocus.current?.focus(); }}
    className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-on-surface/40 sm:p-8">
    <h2 id="discard-wedding-title" className="font-display-md text-3xl text-primary">Discard unsaved changes?</h2>
    <p id="discard-wedding-description" className="mt-4 text-sm leading-relaxed text-secondary">Your changes haven’t been saved. Leaving this page will discard them.</p>
    <div className="mt-7 flex flex-wrap justify-end gap-3">
      <button ref={keep} type="button" onClick={() => dialog.current?.close()} className="min-h-11 rounded-full border border-outline-variant px-5 py-2.5 text-sm font-semibold text-primary">Keep editing</button>
      <button type="button" onClick={() => { bypass.current = true; dialog.current?.close(); onDiscard(); action.current?.(); }} className="min-h-11 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary">Discard and leave</button>
    </div>
  </dialog>;
}

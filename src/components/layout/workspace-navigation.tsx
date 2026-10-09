"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { installWorkspaceHistoryGuard } from "./workspace-history";

type Guard = (proceed: () => void) => boolean;
const NavigationContext = createContext<{ block: (proceed: () => void) => boolean; register: (guard: Guard) => () => void }>({ block: () => false, register: () => () => {} });
export function WorkspaceNavigationProvider({ children }: { children: ReactNode }) {
  const guard = useRef<Guard | null>(null);
  const block = useCallback((proceed: () => void) => guard.current?.(proceed) ?? false, []);
  const register = useCallback((next: Guard) => { guard.current = next; return () => { if (guard.current === next) guard.current = null; }; }, []);
  useEffect(() => {
    if (!(window as Window & { navigation?: unknown }).navigation) return installWorkspaceHistoryGuard(block);
  }, [block]);
  const value = useMemo(() => ({ block, register }), [block, register]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
export const useWorkspaceNavigation = () => useContext(NavigationContext);
export function WorkspaceLink({ href, onNavigate, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const navigation = useWorkspaceNavigation(), router = useRouter();
  return <Link {...props} href={href} onNavigate={event => {
    if (navigation.block(() => { onNavigate?.(event); router.push(href); })) event.preventDefault();
    else onNavigate?.(event);
  }} />;
}

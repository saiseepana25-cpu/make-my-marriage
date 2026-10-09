import { waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { installWorkspaceHistoryGuard } from "@/components/layout/workspace-history";

test("native hash entries do not disable later dirty Back and Forward guards", async () => {
  window.history.pushState({ __NA: true, tree: "home" }, "", "/");
  let dirty = false;
  let proceed: (() => void) | undefined;
  const block = vi.fn((action: () => void) => { proceed = action; return dirty; });
  const cleanup = installWorkspaceHistoryGuard(block);
  try {
    window.location.hash = "main-content";
    await waitFor(() => expect(window.history.state).toMatchObject({ __NA: true, tree: "home" }));
    window.location.hash = "features";
    await waitFor(() => expect(window.history.state).toMatchObject({ __NA: true, tree: "home" }));
    window.history.pushState({ __NA: true, tree: "dashboard" }, "", "/dashboard");
    window.history.pushState({ __NA: true, tree: "settings" }, "", "/settings");
    dirty = true; block.mockClear();
    window.history.back();
    await waitFor(() => expect(block).toHaveBeenCalledOnce());
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    window.history.go(-2);
    await waitFor(() => expect(block).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    dirty = false; proceed!();
    await waitFor(() => expect(window.location.pathname + window.location.hash).toBe("/#features"));
    window.history.back();
    await waitFor(() => expect(window.location.hash).toBe("#main-content"));
    window.history.go(3);
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
  } finally { cleanup(); }
});

test("pre-existing null-state fragments retain their actual Back and Forward positions", async () => {
  for (const path of ["/settings", "/settings#one", "/settings#two"]) window.history.pushState(null, "", path);
  let dirty = false;
  let proceed: (() => void) | undefined;
  const block = vi.fn((action: () => void) => { proceed = action; return dirty; });
  const cleanup = installWorkspaceHistoryGuard(block);
  const rendered = vi.fn(); window.addEventListener("popstate", rendered);
  try {
    window.history.back();
    await waitFor(() => expect(rendered).toHaveBeenCalledOnce());
    expect(window.location.hash).toBe("#one");
    dirty = true; block.mockClear(); rendered.mockClear();
    window.history.forward();
    await waitFor(() => expect(block).toHaveBeenCalledOnce());
    await waitFor(() => expect(window.location.hash).toBe("#one"));
    expect(rendered).not.toHaveBeenCalled();
    window.history.forward();
    await waitFor(() => expect(block).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(window.location.hash).toBe("#one"));
    proceed!();
    await waitFor(() => expect(rendered).toHaveBeenCalledOnce());
    expect(window.location.hash).toBe("#two");
    dirty = false; window.history.back();
    await waitFor(() => expect(window.location.hash).toBe("#one"));
    await waitFor(() => expect(rendered).toHaveBeenCalledTimes(2));
  } finally { window.removeEventListener("popstate", rendered); cleanup(); }
});

test("a router-retained wrapper cannot overwrite positions after effect remount", async () => {
  window.history.pushState({ __NA: true, tree: "home" }, "", "/");
  const originalPush = window.history.pushState, originalReplace = window.history.replaceState;
  const firstCleanup = installWorkspaceHistoryGuard(() => false);
  // Next retains bound originals when it patches the native History API.
  const retainedPush = window.history.pushState.bind(window.history);
  const retainedReplace = window.history.replaceState.bind(window.history);
  window.history.pushState = (data, unused, url) => retainedPush(data, unused, url);
  window.history.replaceState = (data, unused, url) => retainedReplace(data, unused, url);
  firstCleanup();
  let proceed: (() => void) | undefined;
  const block = vi.fn((action: () => void) => { proceed = action; return true; });
  const cleanup = installWorkspaceHistoryGuard(block);
  try {
    window.location.hash = "features";
    await waitFor(() => expect(window.history.state).toMatchObject({ tree: "home" }));
    window.history.pushState({ __NA: true, tree: "dashboard" }, "", "/dashboard");
    window.history.pushState({ __NA: true, tree: "settings" }, "", "/settings");
    window.history.back();
    await waitFor(() => expect(block).toHaveBeenCalledOnce());
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    proceed!();
    await waitFor(() => expect(window.location.pathname).toBe("/dashboard"));
  } finally { cleanup(); window.history.pushState = originalPush; window.history.replaceState = originalReplace; }
});

test.each([true, false])("measures jumps to pre-workspace entries instead of guessing, dirty=%s", async dirty => {
  // These same-document entries precede the workspace and have no position tag.
  for (const path of ["/", "/signup", "/dashboard", "/settings"]) window.history.pushState({ __NA: true, path }, "", path);
  let proceed: (() => void) | undefined;
  const block = vi.fn((action: () => void) => { proceed = action; return dirty; });
  const cleanup = installWorkspaceHistoryGuard(block);
  const rendered = vi.fn(); window.addEventListener("popstate", rendered);
  try {
    window.history.go(-3);
    await waitFor(() => expect(block).toHaveBeenCalledOnce());
    if (dirty) {
      await waitFor(() => expect(window.location.pathname).toBe("/settings"));
      expect(rendered).not.toHaveBeenCalled();
      // Keeping edits leaves the original entry and the full traversal intact.
      window.history.go(-3);
      await waitFor(() => expect(block).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(window.location.pathname).toBe("/settings"));
      proceed!();
    }
    await waitFor(() => expect(rendered).toHaveBeenCalledOnce());
    expect(window.location.pathname).toBe("/");
    expect(window.history.state).toMatchObject({ __NA: true, path: "/" });
    dirty = false; window.history.go(3);
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    await waitFor(() => expect(rendered).toHaveBeenCalledTimes(2));
  } finally { window.removeEventListener("popstate", rendered); cleanup(); }
});

test.each([true, false])("recovers an untagged Forward destination at the history boundary, dirty=%s", async dirty => {
  for (const path of ["/settings", "/events", "/tasks"]) window.history.pushState({ __NA: true, path }, "", path);
  window.history.go(-2);
  await waitFor(() => expect(window.location.pathname).toBe("/settings"));
  let proceed: (() => void) | undefined;
  const block = vi.fn((action: () => void) => { proceed = action; return dirty; });
  const cleanup = installWorkspaceHistoryGuard(block);
  const rendered = vi.fn(); window.addEventListener("popstate", rendered);
  try {
    window.history.go(2);
    await waitFor(() => expect(block).toHaveBeenCalledOnce());
    if (dirty) {
      await waitFor(() => expect(window.location.pathname).toBe("/settings"), { timeout: 3000 });
      expect(rendered).not.toHaveBeenCalled();
      // Keep editing, then confirm a second Forward attempt while restoring.
      window.history.go(2);
      await waitFor(() => expect(block).toHaveBeenCalledTimes(2));
      proceed!();
    }
    await waitFor(() => expect(rendered).toHaveBeenCalledOnce(), { timeout: 3000 });
    expect(window.location.pathname).toBe("/tasks");
    expect(window.history.state).toMatchObject({ __NA: true, path: "/tasks" });
    dirty = false; window.history.go(-2);
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    await waitFor(() => expect(rendered).toHaveBeenCalledTimes(2));
  } finally { window.removeEventListener("popstate", rendered); cleanup(); }
});

test.each([-1, 1, -2, 2])("restores and replays history traversal %i without losing router state", async delta => {
  let dirty = false;
  let proceed: (() => void) | undefined;
  const block = vi.fn((action: () => void) => { if (!dirty) return false; proceed = action; return true; });
  const cleanup = installWorkspaceHistoryGuard(block);
  const rendered = vi.fn();
  window.addEventListener("popstate", rendered);
  try {
    for (let index = 0; index < 5; index++) window.history.pushState({ __NA: true, tree: index }, "", `/entry-${index}`);
    window.history.go(-2);
    await waitFor(() => expect(window.location.pathname).toBe("/entry-2"));
    await waitFor(() => expect(rendered).toHaveBeenCalledOnce());
    window.history.replaceState({ __NA: true, tree: "settings" }, "", "/settings");
    dirty = true; rendered.mockClear(); block.mockClear();
    window.history.go(delta);
    await waitFor(() => expect(block).toHaveBeenCalledOnce());
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    expect(window.history.state).toMatchObject({ __NA: true, tree: "settings" });
    expect(rendered).not.toHaveBeenCalled();
    // Keeping the draft must leave Forward/Back available for another attempt.
    window.history.go(delta);
    await waitFor(() => expect(block).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    proceed!();
    await waitFor(() => expect(rendered).toHaveBeenCalledOnce());
    expect(window.location.pathname).toBe(`/entry-${2 + delta}`);
    expect(window.history.state).toMatchObject({ __NA: true, tree: 2 + delta });
  } finally { window.removeEventListener("popstate", rendered); cleanup(); }
});

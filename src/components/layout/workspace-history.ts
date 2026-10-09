const positionKey = "__mmmWorkspacePosition";
type Guard = (proceed: () => void) => boolean;

// Keep entry positions across marketing, auth and workspace routes, while clean too.
// Next's router state is retained so replayed traversals render the intended page.
export function installWorkspaceHistoryGuard(block: Guard) {
  const history = window.history;
  const pushState = history.pushState, replaceState = history.replaceState;
  let position: number = history.state?.[positionKey] ?? 0;
  let currentUrl = new URL(window.location.href);
  let currentState = history.state;
  let trackedLength = history.length;
  let restoring = false, measuring = false, replay = false, allowed = false;
  let active = true;
  replaceState.call(history, { ...history.state, [positionKey]: position }, "");
  const push: History["pushState"] = function (data, unused, url) {
    if (!active) { pushState.call(history, data, unused, url); return; }
    pushState.call(history, { ...data, [positionKey]: position + 1 }, unused, url);
    position += 1;
    currentUrl = new URL(window.location.href); currentState = history.state;
    trackedLength = history.length;
  };
  const replace: History["replaceState"] = function (data, unused, url) {
    if (!active) { replaceState.call(history, data, unused, url); return; }
    replaceState.call(history, { ...data, [positionKey]: position }, unused, url);
    currentUrl = new URL(window.location.href); currentState = history.state;
  };
  history.pushState = push; history.replaceState = replace;
  let pendingDelta = 0;
  let measurementStep = 1;
  let measurementTimer: ReturnType<typeof setTimeout> | undefined;
  const measure = () => {
    // History.go emits no event at a boundary. Reverse the search instead of
    // leaving every future router event suppressed indefinitely.
    measurementTimer = setTimeout(() => {
      if (!active || !measuring) return;
      measurementStep = -measurementStep;
      measure();
    }, 500);
    history.go(measurementStep);
  };
  const proceed = () => {
    if (restoring) { replay = true; return; }
    allowed = true; history.go(pendingDelta);
  };
  const traverse = (event: PopStateEvent) => {
    if (restoring) {
      event.stopImmediatePropagation();
      if (measuring) {
        clearTimeout(measurementTimer);
        pendingDelta -= measurementStep;
        if (event.state?.[positionKey] !== position) { measure(); return; }
        measuring = false;
      }
      restoring = false;
      if (replay) { replay = false; proceed(); }
      return;
    }
    const url = new URL(window.location.href);
    let destination: number | undefined = event.state?.[positionKey];
    const fragmentChange = url.pathname === currentUrl.pathname && url.search === currentUrl.search && url.hash !== currentUrl.hash;
    if (allowed) {
      allowed = false; position = destination ?? position + pendingDelta;
      if (destination === undefined) {
        // Native fragment entries have no router state. Preserve the rendered
        // route when replaying one after measuring its actual direction.
        replaceState.call(history, { ...(event.state ?? (fragmentChange ? currentState : undefined)), [positionKey]: position }, "");
      }
      currentUrl = url; currentState = history.state; trackedLength = history.length;
      return;
    }
    // A growing stack proves this is a new native fragment entry. A null-state
    // fragment with unchanged length may be Back/Forward into older history.
    if (event.state == null && fragmentChange && history.length > trackedLength) {
      destination = position + 1;
      replaceState.call(history, { ...currentState, [positionKey]: destination }, "");
      position = destination; currentUrl = url; currentState = history.state; trackedLength = history.length;
      return;
    }
    if (destination === undefined) {
      // PushState and native fragment entries are tagged. Remaining untagged
      // same-document entries predate it and may lie in either direction.
      // Find our original entry to measure the signed distance, stopping
      // every intermediate popstate before the router can unmount the draft.
      pendingDelta = 0;
      measurementStep = 1;
      replay = !block(proceed);
      event.stopImmediatePropagation(); restoring = true; measuring = true;
      measure(); return;
    }
    const delta = destination - position;
    if (!delta) return;
    pendingDelta = delta;
    if (block(proceed)) {
      event.stopImmediatePropagation(); restoring = true; history.go(-delta);
    } else { position = destination; currentUrl = url; currentState = history.state; }
  };
  window.addEventListener("popstate", traverse, true);
  return () => {
    // Next can retain these wrappers inside its own History API patch. After
    // effect cleanup they must delegate without changing a new guard's tags.
    active = false;
    clearTimeout(measurementTimer);
    window.removeEventListener("popstate", traverse, true);
    if (history.pushState === push) history.pushState = pushState;
    if (history.replaceState === replace) history.replaceState = replaceState;
  };
}

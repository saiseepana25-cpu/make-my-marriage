import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { parseActivityInput } from "@/features/activities/requests";
import { activityDay, activityTimestamp } from "@/features/activities/format";
import { ActivityForm } from "@/components/activities/activity-form";
import { SourceBadge } from "@/components/activities/activity-ui";
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });
test("manual input enforces exact limits, optional clearing and server-owned fields", () => {
  expect(parseActivityInput({ title: "  శుభం  ", description: null, relatedEventId: "", activityType: " ", createdBy: "forged", sourceType: "SYSTEM" })).toEqual({ title: "శుభం", description: undefined, relatedEventId: undefined, activityType: undefined });
  expect(parseActivityInput({ title: "x".repeat(120), description: "x".repeat(5000), activityType: "x".repeat(80) }).title).toHaveLength(120);
  for (const patch of [{ title: " " }, { title: "x".repeat(121) }, { description: "x".repeat(5001) }, { activityType: "x".repeat(81) }, { relatedEventId: "bad" }, { description: [] }]) expect(() => parseActivityInput({ title: "x", ...patch })).toThrow();
});
test("timeline grouping uses India days at midnight, with fixed calendar dates", () => {
  const now = Date.parse("2026-10-08T18:31:00Z");
  expect(activityDay("2026-10-08T18:30:00Z", now)).toBe("Today · 9 Oct 2026");
  expect(activityDay("2026-10-08T18:29:00Z", now)).toBe("Yesterday · 8 Oct 2026");
  expect(activityDay("2026-10-06T18:29:00Z", now)).toBe("6 Oct 2026");
  expect(activityTimestamp("2026-10-08T18:30:00Z")).toMatch(/9 Oct 2026.*12:00.*IST/);
});
test("SYSTEM is labelled Automatic update in product UI", () => {
  render(<SourceBadge source="SYSTEM" />); expect(screen.getByText("Automatic update")).toBeVisible(); expect(screen.queryByText("SYSTEM")).not.toBeInTheDocument();
});
test("failed save preserves all four fields and preview, then permits retry", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Offline"));
  render(<ActivityForm authorName="Sai" events={[{ id: "000000000000000000000001", name: "Haldi" }]} />);
  fireEvent.click(screen.getByRole("button", { name: "Save update" })); expect(screen.getByLabelText(/^Title/)).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Outfits [QA]" } });
  fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: "శుభం — ready for everyone" } });
  fireEvent.change(screen.getByLabelText(/^Related event/), { target: { value: "000000000000000000000001" } });
  fireEvent.click(screen.getByRole("button", { name: "Wardrobe" }));
  fireEvent.click(screen.getByRole("button", { name: "Save update" })); await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("All your entered details have been preserved"));
  expect(screen.getByLabelText(/^Title/)).toHaveValue("Outfits [QA]"); expect(screen.getByLabelText(/^Description/)).toHaveValue("శుభం — ready for everyone"); expect(screen.getByLabelText(/^Related event/)).toHaveValue("000000000000000000000001"); expect(screen.getByRole("textbox", { name: /^Category/ })).toHaveValue("Wardrobe");
  expect(screen.getByRole("complementary", { name: "Update preview" })).toHaveTextContent("Outfits [QA]");
  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { id: "000000000000000000000002" } }), { status: 201 }));
  fireEvent.click(screen.getByRole("button", { name: "Retry save" })); await waitFor(() => expect(router.push).toHaveBeenCalledWith("/activities/000000000000000000000002?saved=created"));
  fireEvent.submit(screen.getByRole("button", { name: "Saving…" }).closest("form")!); expect(fetch).toHaveBeenCalledTimes(2);
});
test("in-flight saves disable cancellation and prevent duplicate submissions", async () => {
  let resolve: (value: Response) => void = () => {};
  const fetch = vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise<Response>(done => { resolve = done; }));
  render(<ActivityForm authorName="Sai" events={[]} />);
  fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Family update" } });
  fireEvent.click(screen.getByRole("button", { name: "Save update" }));
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled(); expect(screen.getByLabelText(/^Title/)).toBeDisabled();
  fireEvent.submit(screen.getByRole("button", { name: "Saving…" }).closest("form")!); expect(fetch).toHaveBeenCalledTimes(1);
  resolve(new Response(JSON.stringify({ success: false, message: "Try later" }), { status: 500 }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Retry save" })).toBeEnabled());
});

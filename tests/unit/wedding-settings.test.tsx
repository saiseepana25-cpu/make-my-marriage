import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { parseWeddingPatch } from "@/features/weddings/requests";
import { WeddingDetailsForm, WeddingSettings } from "@/components/weddings/wedding-settings";
import { WorkspaceNavigationProvider } from "@/components/layout/workspace-navigation";
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const wedding = { id: "000000000000000000000001", groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28T00:00:00.000Z", location: "Hyderabad", websiteSlug: "sai-adya" };
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });
test("wedding updates allow only four validated fields, including past leap-day dates", () => {
  expect(parseWeddingPatch({ groomName: "  శుభం  ", weddingDate: "2020-02-29", websiteSlug: "changed", weddingId: "forged", totalBudget: 0 })).toEqual({ groomName: "శుభం", weddingDate: "2020-02-29" });
  expect(parseWeddingPatch({ brideName: "x".repeat(100), location: "x".repeat(200) })).toEqual({ brideName: "x".repeat(100), location: "x".repeat(200) });
  for (const input of [{}, { websiteSlug: "changed" }, { groomName: " " }, { brideName: "x".repeat(101) }, { location: "x".repeat(201) }, { weddingDate: "2027-02-29" }, { weddingDate: "2027-02-28T00:00:00Z" }, { location: null }]) expect(() => parseWeddingPatch(input)).toThrow();
});
test("failed save preserves fields and draft preview, retries and establishes saved baseline", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Offline"));
  render(<WorkspaceNavigationProvider><WeddingDetailsForm wedding={wedding} role="OWNER" /></WorkspaceNavigationProvider>);
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/Groom’s name/), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" })); expect(screen.getByLabelText(/Groom’s name/)).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Groom’s name/), { target: { value: "Sai Kumar" } });
  fireEvent.change(screen.getByLabelText(/Bride’s name/), { target: { value: "Adya Devi" } });
  fireEvent.change(screen.getByLabelText(/Wedding date/), { target: { value: "2020-02-29" } });
  fireEvent.change(screen.getByLabelText(/Wedding location/), { target: { value: "Bengaluru & Hyderabad" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("We couldn’t save your changes"));
  expect(screen.getByRole("complementary", { name: "Wedding preview" })).toHaveTextContent("Sai Kumar & Adya Devi");
  expect(screen.getByRole("complementary", { name: "Wedding preview" })).toHaveTextContent("Bengaluru & Hyderabad");
  expect(screen.getByLabelText(/Wedding date/)).toHaveValue("2020-02-29");
  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { ...wedding, groomName: "Sai Kumar", brideName: "Adya Devi", weddingDate: "2020-02-29T00:00:00Z", location: "Bengaluru & Hyderabad" } })));
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Wedding details updated successfully."));
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled(); expect(router.refresh).toHaveBeenCalledOnce(); expect(router.push).not.toHaveBeenCalled();
});
test("in-flight changes lock fields and prevent duplicate submits", async () => {
  let resolve!: (value: Response) => void;
  const fetch = vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise<Response>(done => { resolve = done; }));
  render(<WorkspaceNavigationProvider><WeddingDetailsForm wedding={wedding} role="ADMIN" /></WorkspaceNavigationProvider>);
  fireEvent.change(screen.getByLabelText(/Wedding location/), { target: { value: "Mumbai" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.getByLabelText(/Wedding location/)).toBeDisabled(); expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  fireEvent.submit(screen.getByRole("button", { name: "Saving…" }).closest("form")!); expect(fetch).toHaveBeenCalledOnce();
  resolve(new Response(JSON.stringify({ success: false }), { status: 500 }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled());
});
test("family members see saved values without edit or save controls", () => {
  render(<WeddingDetailsForm wedding={wedding} role="FAMILY_MEMBER" />);
  expect(screen.getByText("Only the wedding owner or an admin can edit these details.")).toBeVisible();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
});
test("failed loads allow retry; expired sessions show login", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 401 }));
  render(<WeddingSettings role="OWNER" />);
  await waitFor(() => expect(screen.getByRole("heading", { name: "Couldn’t load wedding settings" })).toBeVisible());
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "Session expired" })).toBeVisible()); expect(fetch).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
});

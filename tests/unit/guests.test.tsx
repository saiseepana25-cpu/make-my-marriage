import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { parseGuestInput } from "@/features/guests/requests";
import { GuestForm } from "@/components/guests/guest-form";
import { GuestMetrics } from "@/components/guests/guest-ui";
import type { WeddingGuest } from "@/features/guests/types";
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });
test("guest input keeps counts optional, zero valid and strips unapproved fields", () => {
  const guest = parseGuestInput({ name: " Sai శుభం ", email: " TEST@EXAMPLE.COM ", rsvpStatus: "PENDING", weddingId: "forged", rsvpUpdatedAt: "forged", side: "groom", household: "forged" });
  expect(guest).toMatchObject({ name: "Sai శుభం", email: "test@example.com" });
  expect(guest.numberInvited).toBeUndefined(); expect(guest.numberAttending).toBeUndefined(); expect(guest).not.toHaveProperty("weddingId"); expect(guest).not.toHaveProperty("rsvpUpdatedAt");
  expect(parseGuestInput({ name: "x", rsvpStatus: "NOT_ATTENDING", numberInvited: 0, numberAttending: 0 })).toMatchObject({ numberInvited: 0, numberAttending: 0 });
  expect(parseGuestInput({ name: "x", rsvpStatus: "ATTENDING", numberInvited: null, numberAttending: "", notes: " " }).numberInvited).toBeUndefined();
});
test("guest validation rejects missing name, invalid email/status and negative/fractional/unsafe counts", () => {
  for (const patch of [{ name: " " }, { email: "bad@" }, { rsvpStatus: "bad" }, { phone: [] }, { notes: "x".repeat(5001) }]) expect(() => parseGuestInput({ name: "x", rsvpStatus: "PENDING", ...patch })).toThrow();
  for (const key of ["numberInvited", "numberAttending"]) for (const value of [-1, 1.5, NaN, Infinity, "2", Number.MAX_SAFE_INTEGER + 1]) expect(() => parseGuestInput({ name: "x", rsvpStatus: "PENDING", [key]: value })).toThrow();
});
test("summary counts records rather than optional people counts, in agreed order", () => {
  render(<GuestMetrics summary={{ total: 24, pending: 10, attending: 12, notAttending: 2 }} />);
  expect(screen.getAllByRole("term").map(node => node.textContent)).toEqual(["Total guest records", "Pending", "Attending", "Not attending"]);
  expect(screen.getAllByRole("definition").map(node => node.textContent)).toEqual(["24", "10", "12", "2"]);
});
test("form validates before saving and preserves all eight fields after failed save", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Offline")); render(<GuestForm families={["Sharma Family"]} />);
  fireEvent.click(screen.getByRole("button", { name: "Save guest" })); expect(screen.getByLabelText(/Guest name/)).toHaveFocus();
  fireEvent.change(screen.getByLabelText(/Guest name/), { target: { value: "Rajesh" } });
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "bad@" } });
  fireEvent.click(screen.getByRole("button", { name: "Save guest" })); expect(screen.getByLabelText(/Email address/)).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "rajesh@example.com" } });
  fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: "+91 1234567890" } });
  fireEvent.click(screen.getByRole("button", { name: "+ Sharma Family" }));
  fireEvent.change(screen.getByLabelText(/Number invited/), { target: { value: "-2" } });
  fireEvent.click(screen.getByRole("button", { name: "Save guest" })); expect(screen.getByLabelText(/Number invited/)).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Number invited/), { target: { value: "0" } });
  fireEvent.change(screen.getByLabelText(/Number attending/), { target: { value: "1.5" } });
  fireEvent.click(screen.getByRole("button", { name: "Save guest" })); expect(screen.getByLabelText(/Number attending/)).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Number attending/), { target: { value: "" } });
  fireEvent.click(screen.getByRole("radio", { name: "Attending" })); fireEvent.change(screen.getByLabelText(/Notes/), { target: { value: "శుభం — family friend" } });
  fireEvent.click(screen.getByRole("button", { name: "Save guest" })); await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Your details are still here"));
  expect(screen.getByLabelText(/Guest name/)).toHaveValue("Rajesh"); expect(screen.getByRole("textbox", { name: /Family name/ })).toHaveValue("Sharma Family"); expect(screen.getByLabelText(/Number invited/)).toHaveValue(0); expect(screen.getByLabelText(/Number attending/)).toHaveValue(null); expect(screen.getByRole("radio", { name: "Attending" })).toBeChecked();
  expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toMatchObject({ numberInvited: 0, numberAttending: null, email: "rajesh@example.com", notes: "శుభం — family friend" });
});
test("saved zero prepopulates and counts can be explicitly cleared without duplicate creates", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: "000000000000000000000001" } }), { status: 200 }));
  const guest: WeddingGuest = { id: "000000000000000000000001", name: "Rajesh", rsvpStatus: "PENDING", numberInvited: 0, numberAttending: 0, createdAt: "2026-10-08T00:00:00Z", updatedAt: "2026-10-08T00:00:00Z" };
  render(<GuestForm guest={guest} families={[]} />); expect(screen.getByLabelText(/Number invited/)).toHaveValue(0);
  fireEvent.change(screen.getByLabelText(/Number invited/), { target: { value: "" } }); fireEvent.change(screen.getByLabelText(/Number attending/), { target: { value: "" } }); fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith(`/guests/${guest.id}?saved=updated`));
  fireEvent.submit(screen.getByRole("button", { name: "Saving…" }).closest("form")!); expect(fetch).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toMatchObject({ numberInvited: null, numberAttending: null });
});

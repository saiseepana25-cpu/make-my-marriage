import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { guestCountdown, guestWebsiteUrl, publicEventTiming, safeLivestreamUrl, validWebsiteSlug, venueMapUrl, weddingDateLabel, websiteOrigin } from "@/features/website/format";
import { ShareGuestLink, WebsiteWorkspace } from "@/components/website/website-workspace";
import { GuestCelebrations } from "@/components/website/guest-celebrations";
import { GuestEventCard } from "@/components/website/website-ui";
import type { WebsiteEvents } from "@/features/website/types";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const event = { id: "1", name: "Haldi", startAt: "2027-02-28T02:30:00Z", venue: "Family Hall" };
const initial: WebsiteEvents = { events: [event], pagination: { page: 1, limit: 1, total: 2, pages: 2 } };
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test("guest dates preserve calendar dates, India countdown boundaries and overnight years", () => {
  const date = "2027-02-28T00:00:00Z";
  expect(weddingDateLabel(date)).toBe("Sunday, 28 February 2027");
  expect(guestCountdown(date, Date.parse("2027-02-27T18:29:59Z"))).toBe("1 day until the wedding");
  expect(guestCountdown(date, Date.parse("2027-02-27T18:30:00Z"))).toBe("Today is the wedding day");
  expect(guestCountdown(date, Date.parse("2027-02-28T18:30:00Z"))).toBe("Celebrating our wedding memories");
  const overnight = publicEventTiming({ startAt: "2026-12-31T18:00:00Z", endAt: "2026-12-31T20:00:00Z" });
  expect(overnight).toContain("31 December 2026"); expect(overnight).toContain("1 January 2027"); expect(overnight.match(/IST/g)).toHaveLength(2);
  expect(publicEventTiming(event)).toContain("8:00 am IST");
});

test("sharing uses a complete canonical URL and rejects unsafe origins and slugs", () => {
  expect(websiteOrigin("https://example.com/nested/path?query=1", true)).toBe("https://example.com");
  expect(guestWebsiteUrl("http://localhost:3000", "sai-adya-123")).toBe("http://localhost:3000/wedding/sai-adya-123");
  for (const value of ["http://example.com", "https://user:password@example.com", "javascript:alert(1)"]) expect(() => websiteOrigin(value)).toThrow();
  expect(() => websiteOrigin("http://localhost:3000", true)).toThrow();
  for (const value of ["../settings", "a/b", "$ne", "a".repeat(121), "", "-bad-"]) expect(validWebsiteSlug(value)).toBe(false);
});

test("map searches are encoded and unsafe stored livestreams are never linked", () => {
  expect(new URL(venueMapUrl({ venue: "Hall & Garden", location: "హైదరాబాద్" })).searchParams.get("query")).toBe("Hall & Garden, హైదరాబాద్");
  for (const value of ["javascript:alert(1)", "data:text/html,hello", "https://user:password@example.com", "http://example.com", "not a URL"]) expect(safeLivestreamUrl(value)).toBeUndefined();
  render(<GuestEventCard event={{ ...event, livestreamUrl: "javascript:alert(1)" }} />);
  expect(screen.queryByRole("link", { name: /Watch livestream/ })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Open in Maps/ })).toHaveAttribute("rel", "noopener noreferrer");
});

test("failed clipboard access preserves the full selectable URL and can retry successfully", async () => {
  const writeText = vi.fn().mockRejectedValueOnce(new Error("Denied")).mockResolvedValueOnce(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const url = `https://example.com/wedding/${"names-".repeat(15)}suffix`;
  render(<ShareGuestLink url={url} />); fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
  const manual = await screen.findByLabelText("Link to copy manually"); expect(manual).toHaveValue(url); expect(manual).toHaveAttribute("readonly");
  fireEvent.focus(manual); expect((manual as HTMLTextAreaElement).selectionEnd).toBe(url.length);
  fireEvent.click(screen.getByRole("button", { name: "Copy link" })); await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Link copied successfully."));
  expect(writeText).toHaveBeenNthCalledWith(2, url); expect(screen.getByRole("link", { name: /Open wedding website/ })).toHaveAttribute("href", url);
});

test("pagination failure retains loaded celebrations and venues then retries the same page", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { events: [{ ...event, id: "2", name: "Reception" }], pagination: { page: 2, limit: 1, total: 2, pages: 2 } } })));
  render(<GuestCelebrations slug="sai-adya" initial={initial} />);
  fireEvent.click(screen.getByRole("button", { name: "Load more celebrations" }));
  await screen.findByRole("heading", { name: "Couldn’t load more celebrations" });
  expect(screen.getByRole("heading", { name: "Haldi" })).toBeVisible(); expect(screen.getByRole("heading", { name: "Family Hall" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Retry celebrations" })); await screen.findByRole("heading", { name: "Reception" });
  expect(screen.queryByRole("button", { name: "Load more celebrations" })).not.toBeInTheDocument();
  expect(fetch).toHaveBeenNthCalledWith(2, "/api/v1/public/weddings/sai-adya/events?page=2&limit=1", expect.objectContaining({ credentials: "omit", cache: "no-store" }));
});

test("family workspace allows sharing but no wedding or event edit controls", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async input => new Response(JSON.stringify({ success: true, data: String(input).includes("/events") ? { events: [], pagination: { total: 0 } } : { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28T00:00:00Z", location: "Hyderabad", websiteSlug: "sai-adya" } })));
  render(<WebsiteWorkspace role="FAMILY_MEMBER" origin="https://example.com" />);
  await screen.findByRole("button", { name: "Copy link" }); await screen.findByRole("heading", { name: "No celebrations yet" });
  expect(screen.queryByRole("link", { name: "Edit wedding details" })).not.toBeInTheDocument(); expect(screen.queryByRole("link", { name: "Manage events" })).not.toBeInTheDocument(); expect(screen.queryByRole("link", { name: "Add event" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View events" })).toHaveAttribute("href", "/events");
});

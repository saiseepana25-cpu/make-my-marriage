import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { EventForm } from "@/components/events/event-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

function fill() {
  fireEvent.change(screen.getByLabelText("Event name", { exact: false }), { target: { value: "Sangeet" } });
  fireEvent.change(screen.getByLabelText("Venue name", { exact: false }), { target: { value: "Family hall" } });
  fireEvent.change(screen.getByLabelText("Event date", { exact: false }), { target: { value: "2027-02-28" } });
  fireEvent.change(screen.getByLabelText("Start time", { exact: false }), { target: { value: "20:00" } });
}
test("missing fields and invalid end ordering prevent a request and focus the invalid field", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  render(<EventForm />);
  fireEvent.click(screen.getByRole("button", { name: "Create event" }));
  expect(screen.getByLabelText(/Event name/)).toHaveFocus();
  expect(screen.getByRole("alert")).toBeVisible();
  fill();
  fireEvent.change(screen.getByLabelText(/End time/), { target: { value: "01:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Create event" }));
  expect(screen.getByText(/For overnight events/)).toBeVisible();
  expect(fetch).not.toHaveBeenCalled();
});
test("a failed save preserves inputs and retry sends the overnight date as an ISO instant", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Disconnected"));
  render(<EventForm />); fill();
  fireEvent.change(screen.getByLabelText(/End time/), { target: { value: "01:00" } });
  fireEvent.change(screen.getByLabelText(/End date/), { target: { value: "2027-03-01" } });
  fireEvent.click(screen.getByRole("button", { name: "Create event" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Your details are still here"));
  expect(screen.getByLabelText(/Venue name/)).toHaveValue("Family hall");
  expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toMatchObject({ startAt: "2027-02-28T14:30:00.000Z", endAt: "2027-02-28T19:30:00.000Z" });
  expect(screen.getByRole("button", { name: "Create event" })).toBeEnabled();
});

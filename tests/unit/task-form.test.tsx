import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { TaskForm } from "@/components/tasks/task-form";
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

test("required title and paired deadline validation focus the invalid field without saving", () => {
  const fetch = vi.spyOn(globalThis, "fetch"); render(<TaskForm events={[]} />);
  fireEvent.click(screen.getByRole("button", { name: "Create task" }));
  expect(screen.getByLabelText(/Task title/)).toHaveFocus();
  fireEvent.change(screen.getByLabelText(/Task title/), { target: { value: "Book venue" } });
  fireEvent.change(screen.getByLabelText("Deadline date"), { target: { value: "2020-01-01" } });
  fireEvent.click(screen.getByRole("button", { name: "Create task" }));
  expect(screen.getByLabelText("Time (IST)")).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
});
test("failed saves retain details; past deadlines are accepted and sent in UTC", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Disconnected"));
  render(<TaskForm events={[]} suggestedTitle="Book venue" />);
  fireEvent.change(screen.getByLabelText("Deadline date"), { target: { value: "2020-01-01" } });
  fireEvent.change(screen.getByLabelText("Time (IST)"), { target: { value: "00:15" } });
  fireEvent.click(screen.getByRole("button", { name: "Create task" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Your details are still here"));
  expect(screen.getByLabelText(/Task title/)).toHaveValue("Book venue");
  expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toMatchObject({ dueAt: "2019-12-31T18:45:00.000Z", eventId: null, priority: "MEDIUM", status: "TODO" });
  fireEvent.click(screen.getByRole("button", { name: "Clear deadline" }));
  expect(screen.getByLabelText("Deadline date")).toHaveValue(""); expect(screen.getByLabelText("Time (IST)")).toHaveValue("");
});
test("a successful save cannot submit again while the details page is opening", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: "000000000000000000000001" } }), { status: 201 }));
  render(<TaskForm events={[]} suggestedTitle="Book venue" />);
  fireEvent.click(screen.getByRole("button", { name: "Create task" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/tasks/000000000000000000000001?saved=created"));
  await waitFor(() => expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled());
  fireEvent.submit(screen.getByRole("button", { name: "Saving…" }).closest("form")!);
  expect(fetch).toHaveBeenCalledTimes(1);
});

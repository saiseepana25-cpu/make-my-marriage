import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { AuthForm } from "@/components/auth/auth-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

afterEach(() => { vi.restoreAllMocks(); });

async function fillAccount(password = "12345678") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Your full name"), "Priya");
  await user.type(screen.getByLabelText("Email address"), "priya@example.com");
  await user.type(screen.getByLabelText("Password", { exact: true }), password);
  await user.type(screen.getByLabelText("Confirm password"), password);
  await user.selectOptions(screen.getByLabelText("Your relationship to the couple"), "BRIDE");
  return user;
}

test("signup does not persist credentials on step one and preserves inputs when going back", async () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  render(<AuthForm mode="signup" />);
  const user = await fillAccount();
  await user.click(screen.getByRole("button", { name: /Continue to wedding details/ }));
  expect(screen.getByRole("heading", { name: "Tell us about your wedding" })).toBeVisible();
  expect(fetch).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Bride’s name"), "Priya");
  await user.click(screen.getByRole("button", { name: /Back to account details/ }));
  expect(screen.getByLabelText("Your full name")).toHaveValue("Priya");
  await user.click(screen.getByRole("button", { name: /Continue to wedding details/ }));
  expect(screen.getByLabelText("Bride’s name")).toHaveValue("Priya");
});

test("signup explains the approved password minimum before advancing", async () => {
  render(<AuthForm mode="signup" />);
  const user = await fillAccount("1234567");
  await user.click(screen.getByRole("button", { name: /Continue to wedding details/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
  expect(screen.getByRole("heading", { name: "Create an account" })).toBeVisible();
});

test("server rejection retains wedding inputs and displays an accessible error", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
    success: false, message: "Too many requests. Please try again later.", error: { code: "RATE_LIMITED" },
  }), { status: 429, headers: { "content-type": "application/json" } }));
  render(<AuthForm mode="signup" />);
  const user = await fillAccount();
  await user.click(screen.getByRole("button", { name: /Continue to wedding details/ }));
  await user.type(screen.getByLabelText("Bride’s name"), "Priya");
  await user.type(screen.getByLabelText("Groom’s name"), "Sai");
  fireEvent.change(screen.getByLabelText("Wedding date"), { target: { value: "2027-02-28" } });
  await user.type(screen.getByLabelText("Wedding location"), "Hyderabad");
  await user.click(screen.getByRole("button", { name: "Create my wedding workspace" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Too many requests"));
  expect(screen.getByLabelText("Wedding location")).toHaveValue("Hyderabad");
  expect(fetch).toHaveBeenCalledTimes(1);
  const sent = JSON.parse(fetch.mock.calls[0][1]?.body as string);
  expect(sent.wedding).toMatchObject({ brideName: "Priya", groomName: "Sai", location: "Hyderabad" });
  expect(sent).not.toHaveProperty("confirmPassword");
});

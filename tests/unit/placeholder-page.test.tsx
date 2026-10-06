import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { expect, test } from "vitest";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

test("placeholder has an accessible heading, description and keyboard action", async () => {
  const user = userEvent.setup();
  render(
    <PlaceholderPage title="Events" description="Plan your ceremonies.">
      <Link href="/tasks">View tasks</Link>
    </PlaceholderPage>,
  );
  expect(screen.getByRole("heading", { level: 1, name: "Events" })).toBeVisible();
  expect(screen.getByText("Plan your ceremonies.")).toBeVisible();
  await user.tab();
  expect(screen.getByRole("link", { name: "View tasks" })).toHaveFocus();
});

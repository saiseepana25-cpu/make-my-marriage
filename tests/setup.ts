import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Unit tests execute trusted server modules outside Next's compiler boundary.
vi.mock("server-only", () => ({}));
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});


// Global test setup for Vitest component tests.
// Extends `expect` with jest-dom matchers (toBeInTheDocument, toHaveClass, …)
// and unmounts the React tree after each test.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

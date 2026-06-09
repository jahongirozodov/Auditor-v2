// Global test setup for Vitest component tests.
// Extends `expect` with jest-dom matchers (toBeInTheDocument, toHaveClass, …)
// and unmounts the React tree after each test.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom is missing a few browser APIs our components touch.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      // Reduced-motion ON in tests → count-up/draw-in render their final value
      // immediately (deterministic assertions); visual fidelity is Playwright's job.
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(0), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

afterEach(() => {
  cleanup();
});

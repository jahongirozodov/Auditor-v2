import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vitest: unit + component (frontend) tests. E2E lives in /e2e (Playwright) and is
// excluded here. jsdom gives component tests a DOM; @testing-library renders React.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Specific aliases must come before the bare `@` catch-all so Vite matches
    // them first (first-match wins in object key order).
    alias: [
      {
        find: "server-only",
        replacement: fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
      },
      {
        // Stub @/auth so server actions that import it don't pull in next-auth.
        find: "@/auth",
        replacement: fileURLToPath(new URL("./src/test/auth-stub.ts", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    css: false,
  },
});

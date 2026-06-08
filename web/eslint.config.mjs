import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Design-system adherence (warnings — they guide, they don't block the build).
  // Color/spacing/typography must come from the token layer in src/styles/tokens/,
  // never hardcoded. See AGENT.md → "Design-system adherence".
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Raw hex color — use a design-system color token via var(--…). See src/styles/tokens/.",
        },
        {
          selector:
            "Literal[value=/font-family\\s*:\\s*(?!['\\\"]?(?:Plus Jakarta Sans|Manrope|JetBrains Mono|var\\())/i]",
          message:
            "Font not in the design system. Use var(--font-display | --font-sans | --font-mono).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

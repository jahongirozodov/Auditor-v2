import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points the next-intl plugin at our request config (src/i18n/request.ts is
// auto-detected with the src directory).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Closed-network posture: do not phone home with anonymous telemetry-style
  // headers; keep the powered-by header off.
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);

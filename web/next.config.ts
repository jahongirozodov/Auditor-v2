import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points the next-intl plugin at our request config (src/i18n/request.ts is
// auto-detected with the src directory).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Closed-network posture: do not phone home with anonymous telemetry-style
  // headers; keep the powered-by header off.
  poweredByHeader: false,
  experimental: {
    // Analysis uploads (config/scanner/traffic) accept files up to 10 MB; binary
    // pcap is sent base64-encoded (~+33%). Raise the Server Action body cap from
    // the 1 MB default so large captures are not rejected before the action runs.
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default withNextIntl(nextConfig);

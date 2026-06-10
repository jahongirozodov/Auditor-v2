/**
 * Config-analysis module entrypoint. Detection is AI-driven — the model reads the
 * raw config and returns the vendor, device, and gaps. See {@link analyzeConfigAI}.
 */
export type { ConfigGap, GapSeverity, VendorKey, ConfigDevice, ConfigAnalysis } from "./types";
export { VENDOR_LABELS } from "./types";
export { analyzeConfigAI, type AnalyzeConfigResult } from "./ai";

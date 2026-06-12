import type { NodeKind } from "@/lib/types/entities";

/**
 * Pure heuristics for turning heterogeneous backend data (config-device vendors,
 * finding assets, traffic IPs) into topology node attributes. Best-effort and
 * advisory — unit-tested so the graph build stays deterministic.
 */

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Normalized identity for merging nodes from different sources. */
export function nodeKey(s: string): string {
  return s.trim().toLowerCase();
}

export function isIp(s: string): boolean {
  const m = s.trim().match(IPV4);
  if (!m) return false;
  return m.slice(1).every((o) => Number(o) <= 255);
}

/** Strip the port from a "10.0.0.5:443" destination; returns "" if no IPv4 found. */
export function ipFromDstPort(dstIpPort: string | undefined): string {
  if (!dstIpPort) return "";
  const head = dstIpPort.trim().split(":")[0]?.trim() ?? "";
  return isIp(head) ? head : "";
}

/** Map a config-device vendor label to a node kind. */
export function vendorToKind(vendor: string): NodeKind {
  const v = vendor.toLowerCase();
  if (/asa|fortigate|fortinet|pfsense|firewall/.test(v)) return "firewall";
  if (/nginx|apache|http/.test(v)) return "web";
  if (/ios|juniper|junos|mikrotik|routeros|switch|router/.test(v)) return "switch";
  if (/linux|openssh|sudoers|server/.test(v)) return "server";
  return "server";
}

/** Infer a node kind from a finding asset / hostname string. */
export function assetToKind(asset: string): NodeKind {
  const a = asset.toLowerCase();
  if (isIp(a)) return "endpoint";
  if (/\bfw|firewall/.test(a)) return "firewall";
  if (/\bips\b|ids/.test(a)) return "ips";
  if (/vpn/.test(a)) return "vpn";
  if (/web|portal|www|http/.test(a)) return "web";
  if (/\bdb\b|sql|database|maria|postgres|mysql/.test(a)) return "db";
  if (/wifi|wlan|\bap\b/.test(a)) return "wifi";
  if (/\bsw|switch|core/.test(a)) return "switch";
  if (/\bep\b|endpoint|workstation|pc-/.test(a)) return "endpoint";
  return "server";
}

/** Bucket an IP into a coarse network segment (cosmetic; drives layout seeding). */
export function segmentForIp(ip: string): string {
  const m = ip.trim().match(IPV4);
  if (!m) return "Ichki tarmoq";
  const a = Number(m[1]);
  const b = Number(m[2]);
  const isPrivate = a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  if (!isPrivate) return "Tashqi";
  if (a === 10 && b === 0) return "Perimetr";
  if (a === 10 && (b === 10 || b === 20)) return "DMZ";
  if (a === 192 && b === 168) return "Endpoint";
  return "Ichki tarmoq";
}

import type {
  TrafficTimelinePoint,
  TrafficTalker,
  TrafficPort,
  TrafficConversation,
} from "./types";

/** Encode a conversation pair key for counting (src → dst). */
export const convKey = (src: string, dst: string): string => `${src}>${dst}`;

/** Well-known destination ports → service name (best-effort labels for the UI). */
const SERVICES: Record<number, string> = {
  20: "FTP-DATA",
  21: "FTP",
  22: "SSH",
  23: "TELNET",
  25: "SMTP",
  53: "DNS",
  67: "DHCP",
  69: "TFTP",
  80: "HTTP",
  110: "POP3",
  111: "RPC",
  123: "NTP",
  135: "MSRPC",
  137: "NETBIOS",
  139: "NETBIOS",
  143: "IMAP",
  161: "SNMP",
  389: "LDAP",
  443: "HTTPS",
  445: "SMB",
  465: "SMTPS",
  514: "SYSLOG",
  636: "LDAPS",
  993: "IMAPS",
  995: "POP3S",
  1080: "SOCKS",
  1433: "MSSQL",
  1521: "ORACLE",
  3306: "MYSQL",
  3389: "RDP",
  4444: "METASPLOIT",
  5060: "SIP",
  5432: "POSTGRES",
  5900: "VNC",
  6379: "REDIS",
  8080: "HTTP-ALT",
  8443: "HTTPS-ALT",
  9200: "ELASTIC",
  27017: "MONGODB",
};

export function serviceName(port: number): string | undefined {
  return SERVICES[port];
}

function hhmm(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Bucket real event timestamps into an evenly-spaced volume timeline. `epoch`
 * times (seconds since 1970) get HH:MM labels; relative/sequence times get an
 * ordinal "1..N" label. Returns [] when there are no usable timestamps.
 */
export function bucketTimeline(
  times: number[],
  opts: { epoch: boolean; buckets?: number } = { epoch: true },
): TrafficTimelinePoint[] {
  const n = opts.buckets ?? 24;
  if (times.length === 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const t of times) {
    if (t < min) min = t;
    if (t > max) max = t;
  }
  if (!isFinite(min) || !isFinite(max)) return [];

  const counts = new Array(n).fill(0);
  const span = max - min;
  if (span <= 0) {
    // All events at one instant — single populated bucket.
    counts[0] = times.length;
  } else {
    for (const t of times) {
      const idx = Math.min(n - 1, Math.floor(((t - min) / span) * n));
      counts[idx]++;
    }
  }

  return counts.map((packets, i) => {
    const center = span <= 0 ? min : min + (span * (i + 0.5)) / n;
    const label = opts.epoch ? hhmm(center) : String(i + 1);
    return { label, packets };
  });
}

/** Top source IPs by packet count. */
export function topTalkers(counts: Record<string, number>, limit = 8): TrafficTalker[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ip, packets]) => ({ ip, packets }));
}

/** Top destination ports by packet count, annotated with a service name when known. */
export function topPorts(counts: Record<number, number>, limit = 8): TrafficPort[] {
  return Object.entries(counts)
    .map(([port, packets]) => ({ port: Number(port), packets }))
    .sort((a, b) => b.packets - a.packets)
    .slice(0, limit)
    .map((p) => ({ ...p, service: serviceName(p.port) }));
}

/**
 * Top host-to-host conversations by packet count. `counts` is keyed by
 * {@link convKey} (`src>dst`); self-conversations and malformed keys are dropped.
 */
export function topConversations(
  counts: Record<string, number>,
  limit = 60,
): TrafficConversation[] {
  const out: TrafficConversation[] = [];
  for (const [key, packets] of Object.entries(counts)) {
    const gt = key.indexOf(">");
    if (gt <= 0) continue;
    const src = key.slice(0, gt);
    const dst = key.slice(gt + 1);
    if (!src || !dst || src === dst) continue;
    out.push({ src, dst, packets });
  }
  return out.sort((a, b) => b.packets - a.packets).slice(0, limit);
}

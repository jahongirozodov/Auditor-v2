import type { VendorKey } from "./types";

/** Lowercased basename of a path (handles both `/` and `\` separators). */
function baseNameLower(filename: string): string {
  return filename.split(/[\\/]/).pop()?.toLowerCase() ?? "";
}

/**
 * Detect the config vendor from content (primary) with a filename tiebreak.
 * Order matters: more specific markers are checked before generic ones.
 */
export function sniffVendor(filename: string, content: string): VendorKey {
  const name = baseNameLower(filename);

  // Filename-driven Linux configs (content markers below also catch these).
  if (name.includes("sshd_config")) return "linux_sshd";
  if (name === "sudoers" || name.includes("sudoers")) return "linux_sudoers";

  if (/<pfsense>/i.test(content)) return "pfsense";
  if (/^config (system|firewall|global)\b/m.test(content) || /\bset vdom\b/.test(content))
    return "fortinet";
  if (/^set (system|interfaces|security|routing-options)\b/m.test(content)) return "juniper";
  if (
    /^\/(ip|interface|system|user|routing)\b/m.test(content) ||
    /\/ip firewall filter/.test(content)
  )
    return "mikrotik";

  // Cisco ASA vs IOS — ASA-only markers first.
  if (
    /^:\s*Saved/m.test(content) ||
    /\bASA Version\b/.test(content) ||
    /!\s*ASA\s/.test(content) ||
    /^\s*nameif\s/m.test(content) ||
    /access-group\s+\S+\s+in\s+interface/.test(content)
  )
    return "cisco_asa";
  if (
    /^interface\s+(GigabitEthernet|FastEthernet|Ethernet|TenGigabitEthernet)/m.test(content) ||
    /^line\s+vty/m.test(content) ||
    /^\s*transport input\b/m.test(content)
  )
    return "cisco_ios";

  // Linux configs by content.
  if (
    /^\s*(PermitRootLogin|Subsystem\s+sftp|ChallengeResponseAuthentication|HostKey)\b/m.test(
      content,
    )
  )
    return "linux_sshd";
  if (/^Defaults\b/m.test(content) && /ALL=\(ALL/m.test(content)) return "linux_sudoers";

  // Web servers.
  if (/<VirtualHost|<Directory|SSLProtocol|ServerTokens|DocumentRoot/.test(content))
    return "apache";
  if (
    /^\s*(server|http|location)\s*\{/m.test(content) &&
    /\b(listen|server_name|ssl_protocols)\b/.test(content)
  )
    return "nginx";

  return "unknown";
}

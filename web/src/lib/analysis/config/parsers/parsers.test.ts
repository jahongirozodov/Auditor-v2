import { describe, it, expect } from "vitest";
import { parseApache } from "./apache";
import { parseCiscoIos } from "./cisco-ios";
import { parseFortinet } from "./fortinet";
import { parseJuniper } from "./juniper";
import { parseLinuxSshd } from "./linux-sshd";
import { parseLinuxSudoers } from "./linux-sudoers";
import { parseMikrotik } from "./mikrotik";
import { parseNginx } from "./nginx";
import { parsePfsense } from "./pfsense";

const sevs = (gaps: { severity: string }[]) => gaps.map((g) => g.severity).sort();

describe("parseCiscoIos", () => {
  const res = parseCiscoIos(
    [
      "hostname SW-DIST-02",
      "no service password-encryption",
      "enable password cisco123",
      "line vty 0 4",
      " transport input telnet ssh",
      "snmp-server community public RO",
    ].join("\n"),
  );
  it("flags weak management settings", () => {
    expect(res.hostname).toBe("SW-DIST-02");
    expect(sevs(res.gaps)).toEqual(["high", "high", "high", "medium"]);
  });
});

describe("parseLinuxSshd", () => {
  const res = parseLinuxSshd(
    "Protocol 2\nPermitRootLogin yes\nPasswordAuthentication yes\nX11Forwarding yes",
  );
  it("flags root login, password auth and X11", () => {
    expect(sevs(res.gaps)).toEqual(["high", "low", "medium"]);
  });
});

describe("parseLinuxSudoers", () => {
  const res = parseLinuxSudoers(
    "Defaults requiretty\nroot ALL=(ALL:ALL) ALL\n%wheel ALL=(ALL) ALL\ndeploy ALL=(ALL) NOPASSWD: ALL",
  );
  it("flags NOPASSWD and broad group sudo, not the root user line", () => {
    expect(sevs(res.gaps)).toEqual(["critical", "medium"]);
  });
});

describe("parseNginx", () => {
  const res = parseNginx(
    "server {\n listen 443 ssl;\n ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n autoindex on;\n}",
  );
  it("flags weak TLS, autoindex and missing server_tokens off", () => {
    expect(sevs(res.gaps)).toEqual(["high", "low", "medium"]);
    expect(res.gaps.some((g) => g.line === 0)).toBe(true); // absence rule
  });
});

describe("parseApache", () => {
  const res = parseApache(
    "<VirtualHost *:443>\n DocumentRoot /var/www\n SSLProtocol TLSv1.1 TLSv1.2\n ServerTokens Full\n Options Indexes FollowSymLinks\n AllowOverride All\n</VirtualHost>",
  );
  it("flags weak TLS, indexes, tokens and AllowOverride", () => {
    expect(sevs(res.gaps)).toEqual(["high", "low", "low", "medium"]);
  });
});

describe("parseMikrotik", () => {
  const res = parseMikrotik(
    '/system identity set name=RTR-EDGE-01\n/ip service\nset telnet disabled=no\nset api disabled=no\n/user add name=admin password=""',
  );
  it("extracts hostname and flags telnet, api and empty password", () => {
    expect(res.hostname).toBe("RTR-EDGE-01");
    expect(sevs(res.gaps)).toEqual(["critical", "high", "medium"]);
  });
});

describe("parseJuniper", () => {
  const res = parseJuniper(
    "set system host-name JUNI-CORE\nset system services telnet\nset system root-authentication plain-text-password",
  );
  it("flags telnet and plaintext root", () => {
    expect(res.hostname).toBe("JUNI-CORE");
    expect(sevs(res.gaps)).toEqual(["high", "high"]);
  });
});

describe("parseFortinet", () => {
  const res = parseFortinet(
    'config system global\n set hostname "FG-100F"\nend\nconfig system interface\n edit "port1"\n set allowaccess ping https ssh telnet\n next\nend\nset strong-crypto disable',
  );
  it("flags telnet allowaccess and disabled strong-crypto", () => {
    expect(res.hostname).toBe("FG-100F");
    expect(sevs(res.gaps)).toEqual(["high", "medium"]);
  });
});

describe("parsePfsense", () => {
  const res = parsePfsense(
    "<pfsense>\n <hostname>pf-fw-01</hostname>\n <version>2.7.0</version>\n <system><webgui><protocol>http</protocol></webgui></system>\n</pfsense>",
  );
  it("extracts hostname/version and flags HTTP webgui", () => {
    expect(res.hostname).toBe("pf-fw-01");
    expect(res.firmware).toBe("2.7.0");
    expect(res.gaps.some((g) => g.severity === "medium")).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { sniffVendor } from "./sniff";

describe("sniffVendor", () => {
  it("detects Cisco ASA by nameif / ASA markers (not IOS)", () => {
    const cfg = "! ASA 9.16(4)\nhostname FW\ninterface GigabitEthernet0/0\n nameif inside\n";
    expect(sniffVendor("fw.cfg", cfg)).toBe("cisco_asa");
  });

  it("detects Cisco IOS by line vty when no ASA markers", () => {
    const cfg = "hostname SW\nline vty 0 4\n transport input ssh\n";
    expect(sniffVendor("sw.cfg", cfg)).toBe("cisco_ios");
  });

  it("detects sshd by filename and by content", () => {
    expect(sniffVendor("sshd_config", "PermitRootLogin yes")).toBe("linux_sshd");
    expect(sniffVendor("x.conf", "Subsystem sftp /usr/lib/sftp-server")).toBe("linux_sshd");
  });

  it("detects sudoers by filename and Defaults+ALL content", () => {
    expect(sniffVendor("sudoers", "root ALL=(ALL) ALL")).toBe("linux_sudoers");
    expect(sniffVendor("x", "Defaults requiretty\n%wheel ALL=(ALL) ALL")).toBe("linux_sudoers");
  });

  it("distinguishes nginx from apache", () => {
    expect(sniffVendor("nginx.conf", "server {\n listen 443 ssl;\n}")).toBe("nginx");
    expect(
      sniffVendor("httpd.conf", "<VirtualHost *:443>\n DocumentRoot /var/www\n</VirtualHost>"),
    ).toBe("apache");
  });

  it("detects mikrotik, juniper, fortinet and pfsense", () => {
    expect(sniffVendor("r.rsc", "/ip firewall filter add chain=input")).toBe("mikrotik");
    expect(sniffVendor("j.conf", "set system host-name JUNI")).toBe("juniper");
    expect(sniffVendor("fg.conf", 'config system global\n set hostname "FG"\nend')).toBe(
      "fortinet",
    );
    expect(sniffVendor("cfg.xml", "<pfsense><version>2.7.0</version></pfsense>")).toBe("pfsense");
  });

  it("falls back to unknown for unrecognized content", () => {
    expect(sniffVendor("notes.txt", "just some random notes")).toBe("unknown");
  });
});

# 05 — Analysis modules & AI

> Source: TZ §10–11 (translated). **Requirement.** Parser internals are .NET libraries today
> (SharpPcap, HtmlAgilityPack, …); in our stack the equivalents differ, but the **inputs, outputs, and
> the upload → parse → normalize → AI → draft-finding pipeline are the contract.**

## Configuration analysis (TZ §10.1)

Parsers exist for these formats/vendors:

- Cisco IOS / IOS-XE (running-config, startup-config)
- Linux SSH (`/etc/ssh/sshd_config`) and sudoers (`/etc/sudoers`)
- Nginx (`nginx.conf`, sites-available)
- Apache HTTPD (`httpd.conf`, vhosts)
- MikroTik RouterOS export

Each parser auto-detects security gaps and proposes them as **Vulnerability** drafts; AI enriches the
recommendations.

## Scanner import (TZ §10.2)

- Nessus / Tenable (`.nessus` XML)
- Nmap (XML, `-oX`)
- OpenVAS / GVM (XML report)
- Burp Suite (XML), OWASP ZAP (JSON/XML)
- IP Scanner (CSV)

Content-sniffing selects the parser automatically and imports results as vulnerabilities.

## Traffic analysis (TZ §10.3)

- PCAP / PCAPNG — packet-level analysis
- Wireshark CSV export
- Suricata EVE JSON (alerts)
- Zeek `conn.log`

## Network topology (TZ §10.4)

- An IP-to-IP relationship graph is built from traffic files.
- Interactive **force-directed** visualization in the web UI (D3.js in the original; the prototype ships
  a **custom force simulation** — see [../project/app/ui_kits/auditor/screens-topology.jsx](../project/app/ui_kits/auditor/screens-topology.jsx)).
- The user can save the layout (`SaveTopologyLayoutCommand`).

## AI integration — Ollama (TZ §11)

- **Provider:** local Ollama (port 11434). Model configured via settings. Local execution keeps
  confidential audit data off external services. A **ModelPicker** lets users choose the model on
  AI-enabled pages.
- **Where AI is used:** config analysis (enrich gap recommendations), scanner results (enrich/sort),
  traffic analysis (explain anomalies), reports (Executive Summary generation), findings (enrich
  recommendation text).
- **Session history:** every AI call is stored in `AiAnalysisResult` (input, output, model, latency,
  token count). The `/ai` page shows history.

> In our stack: a `/api/ai` Route Handler proxies to local Ollama (streaming), injects audit context
> into the system prompt, sanitizes output (no `dangerouslySetInnerHTML`), and writes every call to
> `AiAnalysisResult`. See [../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md) Phase 6.

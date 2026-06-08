# ADR-0003 — Report export (PDF/DOCX) library

- **Status:** Open
- **Date:** 2026-06-08

## Context

The TZ requires report export to **PDF / DOCX / XLSX / HTML** (via .NET QuestPDF / OpenXml / ClosedXML)
with six templates — see [../06-reporting-kpi-notifications.md](../06-reporting-kpi-notifications.md).
The system is report-heavy and the prototype includes a dedicated print layout ("Auditor — Print").

In a Next.js/TypeScript stack the export-generation approach is a real choice with trade-offs.

## Decision

**Open.** Build report screens **print-first** now (a `@media print` stylesheet + an isolated print
route that hides the app chrome and paginates cleanly). Defer the binary-export library decision.

Candidate approaches:

| Approach | PDF | DOCX | Notes |
| --- | --- | --- | --- |
| Headless Chromium (Puppeteer/Playwright) | ✅ (print route → PDF) | ✖ | Pixel-faithful to the web design; heavy runtime dep |
| `@react-pdf/renderer` | ✅ | ✖ | React-native layout model; separate from the web CSS |
| Server libs (`pdfkit`, `docx`, `exceljs`) | ✅ | ✅ | Most control; reimplement layout per format |
| Reuse existing .NET exporters (QuestPDF/OpenXml) | ✅ | ✅ | Only if backend path B ([ADR-0001](0001-frontend-stack.md)) |

## Consequences

- HTML/print output works early with zero extra dependency.
- PDF/DOCX/XLSX generation is decided once backend path and air-gapped-runtime constraints are known
  (headless Chromium needs a bundled browser in a closed network).

## Open questions

1. Which formats are truly required at launch (PDF only, or DOCX/XLSX too)?
2. Air-gapped runtime: is bundling a headless browser acceptable?
3. If backend path B, do we just call the existing .NET export endpoints?

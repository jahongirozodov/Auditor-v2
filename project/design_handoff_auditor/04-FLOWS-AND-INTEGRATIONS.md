# 04 — Flows & Integrations

Asosiy biznes-oqimlar va tashqi integratsiyalar. Komponent referenslari `design-source/auditor/` da.

## 1) 3-bosqichli tasdiqlash (`ApprovalFlow`)

Ham **audit loyihasi** (§4), ham **finding** (§8) uchun ishlatiladi. Komponent: `components-approval.jsx`.

**Bosqichlar:** `group_lead → head → dept → approved`.
- **Loyiha (project):** Guruh rahbari yuboradi → Bo‘lim boshlig‘i tasdiqlaydi → Departament rahbari yakuniy tasdiqlaydi.
- **Finding:** topuvchi yaratadi → group_lead (1-tasdiq) → head (2-tasdiq) → dept (yakuniy).

**Holatlar:** `current_approval_stage` (group_lead/head/dept) yoki `null` (yakuniy tasdiqlangan) yoki `returned` (qaytarilgan).

**Amallar (joriy bosqich rolida):**
- **Tasdiqlash** → keyingi bosqich (oxirida `approved`).
- **Qaytarish** → `returned`, **sabab majburiy** (o'zgarmas tarixga yoziladi + muallifga bildirishnoma).
- **Qayta yuborish** (returned holatida, muallif) → 1-bosqichga qaytadi.

**UI:** progress strip (nuqtalar + connector, done/current holat), holat chip ("X ko‘rmoqda" / "Yakuniy tasdiqlangan" / "Qaytarilgan"), **o'zgarmas timeline** (kim/qachon/amal + izoh). Joriy bosqich roli bo'lmagan foydalanuvchiga "Bu bosqichni X hal qiladi" qulf ko'rsatiladi.

**Backend:** har bir o'tish — `approval_events` ga append (immutable), tegishli `current_approval_stage` ni yangilash, bildirishnoma yuborish, RBAC tekshiruvi (kim qaysi bosqichni tasdiqlay oladi). Qaytarish sababi saqlanadi.

## 2) Vazifa workflow

`new → assigned → in_progress → review → done` (+ `returned`, `blocked`). Komponent: `TaskDetailScreen` (`screens-tasks.jsx`).

Holatga mos amallar:
| Joriy | Amallar |
|---|---|
| new | Biriktirish → assigned |
| assigned | Ishni boshlash → in_progress |
| in_progress | Tekshiruvga yuborish → review · Bajarildi → done |
| review | Ma'qullash → done · Qaytarish → returned |
| returned | Qayta boshlash → in_progress |
| blocked | Blokni ochish → in_progress |

Har o'tish tarixga yoziladi (kim/qachon). Biriktirish/qayta biriktirish faqat **group_lead** (yoki yuqori). Vazifa biriktirilganda mas'ulga bildirishnoma. Vazifa ichida **topilma qo'shish** (finding create modal) va linked findings.

**Taqsimlash (`AssignScreen`):** group_lead auditni tanlaydi, har vazifaga inline mas'ul biriktiradi; **ish yuki taqsimoti** real vaqtda yangilanadi (har a'zo uchun vazifa soni). Muvozanat KPI samaradorligini oshiradi.

## 3) AI / Ollama integratsiyasi (yopiq kontur)

**Prototipda** chat `window.claude.complete(prompt)` ni chaqiradi (faqat demo muhitda). **Production'da** buni **lokal Ollama** ga proxy qiluvchi Next.js Route Handler bilan almashtiring — tashqi internetga chiqmaydi.

```ts
// app/api/ai/route.ts
import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  const { messages, model = "qwen2.5:14b-instruct" } = await req.json();
  // RBAC + audit-kontekst tekshiruvi shu yerda
  const r = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {     // masalan http://localhost:11434
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
  });
  // Ollama javobini stream qilib uzating (ReadableStream)
  return new Response(r.body, { headers: { "Content-Type": "text/event-stream" } });
}
```

**System prompt** (prototipda `AIScreen.buildPrompt` da): "Sen Auditor AI yordamchisisan, lokal Ollama (qwen2.5:14b), yopiq tarmoqda. Faqat o'zbek (lotin), rasmiy. Audit konteksti: kod, tashkilot, findinglar soni (critical/high/medium/low), vazifalar. Tuzilgan markdown javob ber." — shu kontekstni har so'rovga qo'shing.

**UI talablar:** typing indikator, markdown render (sarlavha/ro'yxat/qalin/inline-kod), Enter=yuborish + Shift+Enter=yangi qator, preset chiplar (Executive summary/Remediation plan/Critical guruhlash/Config izoh/KPI xulosa), model selektori, audit konteksti footer ("Yopiq tarmoq · tashqi servisga yuborilmaydi"). Har sessiya `AiAnalysisResult` ga (input/output/model/token/latency) yoziladi. **Streaming** tavsiya etiladi (Ollama `stream: true`).

**Sozlamalar → AI/Ollama:** URL, model, max token (context), temperature, "test ulanish", yopiq kontur toggle, tarix saqlash toggle.

## 4) EXE agent + tokenlar

Har audit uchun alohida **token** generatsiya qilinadi (`AuditToken`). Desktop **EXE agent** shu token bilan ulanadi, faqat o'ziga biriktirilgan vazifalar bo'yicha ma'lumot yig'adi (config dump, scan output, pcap), serverga **sinxronlaydi**. Token muddati/holati boshqariladi; sync hodisasi log va bildirishnoma yaratadi. `AgentScreen` — demo vizualizatsiya.

## 5) Tahlil quvuri (config / scanner / traffic)

Fayl yuklanadi → parser → **normalizatsiya** (yagona finding modeliga) → AI tahlil (Ollama) → finding qoralamalari → auditga biriktirish.
- **Skaner:** Nessus / Nmap / OpenVAS / Burp / ZAP.
- **Konfiguratsiya:** Cisco IOS/ASA, Juniper, Fortinet, MikroTik, pfSense, Linux iptables, Nginx, Apache, Wi-Fi controller.
- **Trafik:** PCAP / Wireshark / Suricata / Zeek (anomaliya: DNS tunneling, C2 va h.k.).
UI: drag-drop zona, tahlil qilingan obyektlar ro'yxati (severity hisob), kod/log preview (satr raqami + highlight), AI tahlil natijasi kartasi ("N ta finding yaratish").

## 6) Tarmoq topologiyasi (force-directed graf)

Komponent: `screens-topology.jsx` (CDN'siz **o'z simulyatsiyasi** — charge repulsion + edge spring + centering, ~600 frame relaxation; production'da `d3-force` yoki shu algoritmni saqlash mumkin).

**Ma'lumot:** `TOPOLOGY.nodes/edges` (`03` ga qarang). Tugun rangi = eng yuqori severity; badge = findinglar soni.
**Interaksiya:** tugunni sudrash (zoom-aware), scroll-zoom (kursorga, 0.4–3×), bo'sh joyni sudrab pan, zoom in/out/**fit**/reset tugmalari, zoom % yorlig'i, severity filtr chiplari, **shubhali oqim** toggle.
**Jonli (gated reduced-motion):** edge bo'ylab **oqim paketlari** (`.topo-flow`, flagged=qizil+tez), critical/high tugunlarda **pulsing alert halqa** (`.topo-pulse`). Inspektor: tugun IP/segment/severity/findinglar + bog'liq findinglar + izoh.

**Next.js eslatma:** graf **client component** (`"use client"`); SVG + rAF simulyatsiya; `prefers-reduced-motion` da animatsiyani o'chiring.

## 7) ⌘K Command palette

Komponent: `components-search.jsx`. Global qidiruv: sahifalar, auditlar, findinglar, vazifalar, tashkilotlar, foydalanuvchilar. Klaviatura nav (↑/↓/Enter/Esc), kategoriya bo'yicha guruhlash, ⌘K/Ctrl+K ochadi. Natijani tanlash → tegishli route (org → org detali). Next.js'da global client provider + `useRouter().push`.

## 8) Boshqa interaksiyalar
- **Bildirishnomalar (bell):** critical zaiflik, finding qaytarish, yangi vazifa, hisobot tayyor, agent sync — har biri Sozlamalarda toggle + email (SMTP).
- **Tema:** `data-theme` + `localStorage`; almashtirishda `.ds-no-transition`.
- **Toast:** `window.showToast(msg, type)` → Next.js'da toast provider (sonner yoki o'z implementatsiya).
- **Confirm dialog:** `window.confirmAction({title, body, confirmLabel, danger})` → Promise<boolean>; destruktiv amallar uchun.
- **Tweaks panel (prototip):** rol/tema/AI almashtirish — bu **faqat demo**; production'da sessiya/sozlamalardan keladi, Tweaks olib tashlanadi.
- **Boot ketma-ketligi:** sessiyada bir marta (sessionStorage). Production'da ixtiyoriy splash.

## Animatsiya inventari (CSS, `kit-extra.css` + `wow.css`)
`.apf__*` approval · `.tflow*` task workflow strip · `.topo-*` topology (flow/pulse/zoom) · `.cmdk*` command palette · `.login__*` WOW login (bloblar/sweep/scan/particles/radar/sheen) · `.aimd/.ai-typing` AI chat · `.stat`/`.panel` hover spotlight (`--mx/--my`) · count-up raqamlar · route cross-fade. **Hammasi `prefers-reduced-motion: no-preference` bilan gate.**

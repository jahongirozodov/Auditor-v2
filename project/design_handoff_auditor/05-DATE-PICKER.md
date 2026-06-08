# 05 — Date picker (calendar popup) "stilsiz" muammosi

## Muammo
Sana maydonining calendar popup'i dizayn-tizimga mos kelmaydi — brauzer default ko'rinishida (serif shrift, ko'k linklar, qora ramka, US format `MM/DD/YYYY`, inglizcha `Clear/Today`).

## Sabab
1. **Portal:** ko'pchilik date-picker kutubxonalari (`react-datepicker`, `react-date-picker`) va native `<input type="date">` popup'ni **`document.body` ga portal orqali** chiqaradi — sizning karta/konteyner scope'ingizdan tashqarida. Scoped CSS (CSS Modules, `styled-components`, Tailwind `@apply` lokal) unga yetib bormaydi.
2. **Import qilinmagan stylesheet:** kutubxona o'z CSS'iga tayanadi. Uni import qilmasangiz — stilsiz chiqadi:
   ```ts
   import "react-datepicker/dist/react-datepicker.css"; // ko'pincha unutiladi
   ```
3. **Native input:** `<input type="date">` popup'ini OS/brauzer chizadi — uni **umuman stillab bo'lmaydi** (faqat juda cheklangan `::-webkit-*` selektorlar).

## Yechim
Dizayn-tizim token'lariga to'liq bog'langan **o'z calendar komponenti**ni ishlating. Token'lar global `:root[data-theme]` da bo'lgani uchun, popup portal'da bo'lsa ham, light/dark'da ham to'g'ri stillanadi.

Ushbu paketda tayyor:
- **`components/DatePicker.tsx`** — Next.js/React + TS komponent (`"use client"`).
- **`components/date-picker.css`** — `.dp-*` klasslari, faqat `var(--*)` token'lardan rang oladi.

### Ishlatish
```tsx
import { DatePicker } from "@/components/DatePicker";
import "@/components/date-picker.css"; // yoki globals.css ga qo'shing

function MuddatField() {
  const [due, setDue] = useState("2026-05-30");
  return <DatePicker value={due} onChange={setDue} placeholder="Muddatni tanlang" />;
}
```

### Xususiyatlari (dizayn-tizimga mos)
- Format **`YYYY-MM-DD`** (Auditor konvensiyasi), na `MM/DD/YYYY`.
- Hafta **dushanbadan** boshlanadi; weekday'lar o'zbekcha (`Du Se Ch Pa Ju Sh Ya`).
- Tanlangan kun **brend rangda** (`--brand`), bugungi kun ramkali (`--border-strong`), oydan tashqari kunlar muted (`--text-muted`).
- Oy nomi o'zbekcha; `‹ ›` navigatsiya; pastda **`Tozalash` / `Bugun`**.
- Klaviatura: maydon Enter/Space bilan ochiladi, popup Esc bilan yopiladi, tashqariga bosish yopadi.
- Mono raqamlar (`--font-mono`), karta radius/soyasi (`--radius-lg`, `--shadow-lg`), `prefers-reduced-motion` bilan gate qilingan pop animatsiya.
- **Inline variant** ham mavjud (doimo ochiq panel) — `date-picker-demo.html` ichidagi `CalendarPanel` ga qarang; bir xil markup, `position: static`.

## Agar tashqi kutubxona shart bo'lsa
`react-day-picker` (headless, shadcn `Calendar` shu asosda) ni ishlating va uni token'lar bilan stilang — `react-datepicker`'dan ko'ra moslashuvchan. Lekin bu loyiha uchun **o'z komponentimiz** (yuqorida) eng toza yo'l: nol bog'liqlik, to'liq dizayn-tizim nazorati.

> Jonli namuna (ikkala tema): loyihada `date-picker-demo.html` ni oching — popover variant, inline variant, dark/light almashtirgich bilan.

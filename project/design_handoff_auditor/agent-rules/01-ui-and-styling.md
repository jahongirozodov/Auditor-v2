# agent-rules/01-ui-and-styling.md

## Tokenlar
- **Faqat** `var(--*)` semantik aliaslar: `--bg-page/surface/surface-2/surface-3/input/hover`, `--text-primary/secondary/tertiary/muted`, `--brand*`, `--status-{success,warning,danger,info,neutral}-{bg,fg}`, `--border-color/strong/subtle`. Aniq qiymatlar `01-DESIGN-TOKENS.md`.
- Xom hex/rgb yozma (faqat dizayn-token ta'rifi fayllarida ruxsat). Token ro'yxatda yo'q bo'lsa — mavjudini ishlat, yangi o'ylab topma.
- Radius: 6px kontrol · 12px karta · 16–20px hero · 999px pill/avatar. Spacing: 4px grid.

## Komponent CSS qatlami
- Tayyor klasslarni qayta ishlat: `.btn(.btn--primary/secondary/ghost/soft/danger/sm/lg/xs)`, `.iconbtn`, `.tag(.tag--*)`, `.sev(.sev--*)`, `.stat`, `.panel(.panel__h/body/foot/t)`, `.card`, `.avatar`, `.tabs`, `.input/.select/.textarea/.field/.input-group/.checkbox`, `.tbl(.tbl-wrap/scroll, .cell-sub/mono/actions)`, `.drawer`, `.modal`, `.lrow`, `.code-block`. Qo'shimchalar `kit-extra.css`: `.apf__*`, `.tflow*`, `.topo-*`, `.cmdk*`, `.login__*`, `.aimd/.ai-typing`, `.set-*`.
- React komponent — shu klasslar ustiga ingichka, tiplangan wrapper. Yangi vizual stil kerak bo'lsa, mavjud vokabulyarga mos qil.

## Tipografiya
- `--font-display` (Plus Jakarta Sans) sarlavha/KPI · `--font-sans` (Manrope) body/UI · `--font-mono` (JetBrains Mono) kod/ID/raqam.
- Sentence case. UPPERCASE faqat kichik meta/stat/sidebar-guruh label (`--tracking-caps`). Body 15px, dense jadval 13px.

## Tema
- `data-theme="dark"` default. Faqat aliaslar orqali rangla → light avtomatik. Almashtirishda `.ds-no-transition`.

## Motion
- Har animatsiya `@media (prefers-reduced-motion: no-preference)`. Easing `--ease-out`, 120/200/320ms. Bounce/spring/parallax yo'q.
- Patternlar: route cross-fade, staggered kirish, count-up (birinchi paint), hover spotlight (`--mx/--my`), press 1px nudge, focus `--brand-ring`.

## Layout
- App shell: Sidebar (~248px, collapsed ~64px) + Topbar (68px) + scroll main. Konteyner 1240px.
- Responsive: stat grid 4→2→1; sidebar narrow'da overlay; login chap paneli ≤960px da yashirin.
- Flex/grid + `gap`; margin-hack yo'q.

## A11y
- Semantik HTML, `<button>`/`<a>` to'g'ri ishlatish, ARIA faqat kerakda.
- Fokus halqasi ko'rinadigan (`--brand-ring`). Klaviatura: ⌘K palette, drawer/modal Esc, tab tartibi.
- Kontrast AA. Ikonkalar `aria-hidden`, matnli label bilan.

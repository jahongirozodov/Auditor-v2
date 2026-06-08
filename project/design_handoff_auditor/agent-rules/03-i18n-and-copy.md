# agent-rules/03-i18n-and-copy.md

## Til
- **Barcha UI matni — O'zbek (lotin).** Hech qanday ingliz interfeys matni (xavfsizlik atamalaridan tashqari: audit, finding, critical/high/medium/low, CVSS, CVE, pentest, KPI, EXE agent, token, sync).
- Ohang: **rasmiy, institutsional, aniq.** Marketing yo'q, undov belgisi yo'q, emoji yo'q, slang yo'q.

## Apostrof / diakritika (MUHIM)
- To'g'ri glyphlardan foydalan: **`o'`** (U+2018 turned comma yoki `oʻ`), **`g'`**, **`'`** (masʼul). ASCII `'` ishlatma.
- Misollar: `bo'lim`, `qo'mita`, `mas'ul`, `qo'shish`, `o'chirish`, `yig'ish`, `bog'lanish`.

## Casing
- **Sentence case** hamma joyda: sahifa sarlavhalari, tugmalar, menyu, jadval sarlavhalari ("Yangi audit", "Mening vazifalarim").
- **Title Case ishlatma.** UPPERCASE faqat: kichik meta/stat label va sidebar guruh sarlavhalari (`ASOSIY`, `TAHLIL`, `TIZIM`) — `--tracking-caps` bilan.

## Person
- O'z scope uchun birinchi shaxs egalik: "Mening auditlarim", "Mening vazifalarim".
- Tizim xabarlari — shaxssiz, faktik: "Audit loyihasi tasdiqlandi", "EXE agent sinxronlandi".

## Raqamlar va sana
- Tabular (`--font-mono`), birinchi paintda count-up. Ball `72/100`, foiz `89%`, delta `+6` / `−18%`.
- Sana `YYYY-MM-DD`. Nisbiy vaqt o'zbekcha: "12 daqiqa oldin", "3 soat oldin", "Kecha".
- Kodlar: audit `AUD-YYYY-NNN`, vazifa `T-NNN`, finding `F-YYYY-NNNN`, asset `FW-CORE-01`.

## Standart iboralar (kit'dan)
- Saqlash · Bekor qilish · Qo'shish · O'chirish · Tahrir · Yopish · Tasdiqlash · Qaytarish · Qayta yuborish · Yuborish · Eksport · Yuklash
- Holatlar: Faol · Nofaol · Jarayonda · Tekshiruvda · Bajarilgan · Tasdiqlangan · Qaytarilgan · Rejalashtirilgan
- Bo'sh holat: "Hech narsa topilmadi." · Destruktiv: "Bu amalni qaytarib bo'lmaydi."
- Toast: sarlavha 1–2 so'z ("Saqlandi", "O'chirildi"), tavsif bir qisqa gap.

## Tarjima qilinmaydigan atamalar
finding, critical/high/medium/low, CVSS, CVE, CWE, pentest, KPI, EXE agent, token, sync, Ollama, qwen2.5. Bularni o'zbekcha gapga aralashtir: "Critical zaiflik aniqlandi", "Findingni tasdiqlash".

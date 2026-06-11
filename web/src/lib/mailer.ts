import "server-only";
import nodemailer from "nodemailer";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? DEFAULT_SETTINGS.notif.smtpHost,
    port: Number(process.env.SMTP_PORT ?? DEFAULT_SETTINGS.notif.smtpPort),
    secure: false,
    auth:
      process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? DEFAULT_SETTINGS.notif.smtpFrom;
  await createTransport().sendMail({
    from,
    to,
    subject: "Auditor: tasdiqlash kodi",
    text: `Sizning tasdiqlash kodingiz: ${code}\n\nKod 5 daqiqa ichida amal qiladi.\n\nAgar siz tizimga kirishga urinmagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.`,
  });
}

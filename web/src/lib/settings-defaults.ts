/**
 * System-settings shapes + defaults (prototype screens-settings.jsx). Pure — usable
 * on client + server. Stored in SystemSetting (key "system"); the data layer merges
 * stored values over these defaults so missing keys always resolve.
 */
import type { PermissionId, RoleCode } from "@/lib/types/roles";

export interface GeneralSettings {
  deptName: string;
  lang: string;
  timezone: string;
  auditCodeFormat: string;
  dateFormat: string;
}

export interface AiSettings {
  ollamaUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  aiEnabled: boolean;
  aiClosed: boolean;
  aiHistory: boolean;
}

export interface NotifSettings {
  nCritical: boolean;
  nReturn: boolean;
  nAssign: boolean;
  nReport: boolean;
  nSync: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpFrom: string;
  smtpEncryption: string;
}

export interface SecuritySettings {
  twoFA: boolean;
  lockout: boolean;
  ipAlert: boolean;
  rls: boolean;
  pwMinLength: number;
  pwHistory: number;
  pwExpiryDays: number;
  auditLogYears: number;
  notifDays: number;
}

export interface SystemSettings {
  general: GeneralSettings;
  ai: AiSettings;
  notif: NotifSettings;
  security: SecuritySettings;
}

export type SettingsSection = keyof SystemSettings;

/** A row in the custom_roles JSONB array. */
export interface CustomRole {
  name: string;
  code: string;
  baseRole: RoleCode;
  permissions: PermissionId[];
  description?: string;
  tone: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    deptName: "Axborot xavfsizligi auditi departamenti",
    lang: "uz",
    timezone: "Asia/Tashkent",
    auditCodeFormat: "AUD-{YYYY}-{NNN}",
    dateFormat: "YYYY-MM-DD",
  },
  ai: {
    ollamaUrl: "http://localhost:11434",
    model: "qwen2.5:14b-instruct",
    maxTokens: 8192,
    temperature: 0.2,
    aiEnabled: true,
    aiClosed: true,
    aiHistory: true,
  },
  notif: {
    nCritical: true,
    nReturn: true,
    nAssign: true,
    nReport: false,
    nSync: true,
    smtpHost: "smtp.gov.uz",
    smtpPort: 587,
    smtpFrom: "auditor@gov.uz",
    smtpEncryption: "STARTTLS",
  },
  security: {
    twoFA: true,
    lockout: true,
    ipAlert: true,
    rls: true,
    pwMinLength: 12,
    pwHistory: 5,
    pwExpiryDays: 90,
    auditLogYears: 7,
    notifDays: 90,
  },
};

export const DEFAULT_CUSTOM_ROLES: CustomRole[] = [];

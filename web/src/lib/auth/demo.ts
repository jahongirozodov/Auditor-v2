// Demo auth constants — plain module (NO "server-only") so both the server auth
// layer and the Prisma seed (run via tsx) can import it.
//
// Demo password for every seeded user (DEV ONLY): "Auditor!2026"
// Argon2id digest (m=65536, t=3, p=4):
export const DEMO_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$yh7c7wvz6iesD3T3D3hbJQ$WbP2WQocd4VL2iOGiooev1G7AB/Yv5x7XHdllV3vePU";

export const DEMO_PASSWORD = "Auditor!2026";

/** Stable demo emails per fixture user id (ASCII, @gov.uz). */
export const EMAILS: Record<string, string> = {
  u1: "a.yoldoshev@gov.uz",
  u2: "d.rasulova@gov.uz",
  u3: "b.mirzayev@gov.uz",
  u4: "s.karimova@gov.uz",
  u5: "o.jorayev@gov.uz",
  u6: "m.sodiqova@gov.uz",
  u7: "j.tursunov@gov.uz",
  u8: "n.ergasheva@gov.uz",
  u9: "s.hamidov@gov.uz",
  u10: "l.aliyeva@gov.uz",
};

export const DEMO_EMAIL = EMAILS.u1;

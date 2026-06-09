import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";

function toOrg(o: {
  id: string;
  name: string;
  stir: string;
  sector: string;
  audits: number;
  contact: string;
}): Organization {
  return {
    id: o.id,
    name: o.name,
    stir: o.stir,
    sector: o.sector,
    audits: o.audits,
    contact: o.contact,
  };
}

type DetailRow = {
  region: string;
  address: string;
  risk: string;
  head: string;
  since: string;
  contacts: { name: string; role: string; email: string; phone: string }[];
  devices: { name: string; kind: string; vendor: string; ip: string; crit: string }[];
};

function toDetail(o: DetailRow): OrgDetail {
  return {
    region: o.region,
    address: o.address,
    risk: o.risk as RiskLevel,
    head: o.head,
    since: o.since,
    contacts: o.contacts.map((c) => ({
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
    })),
    devices: o.devices.map((d) => ({
      name: d.name,
      kind: d.kind,
      vendor: d.vendor,
      ip: d.ip,
      crit: d.crit,
    })),
  };
}

export const getOrgs = cache(
  async (): Promise<Organization[]> => (await prisma.organization.findMany()).map(toOrg),
);

export const getOrgById = cache(async (id: string): Promise<Organization | undefined> => {
  const o = await prisma.organization.findUnique({ where: { id } });
  return o ? toOrg(o) : undefined;
});

export const getOrgDetail = cache(async (id: string): Promise<OrgDetail | undefined> => {
  const o = await prisma.organization.findUnique({
    where: { id },
    include: { contacts: true, devices: true },
  });
  return o ? toDetail(o) : undefined;
});

/** id → OrgDetail map for the list screen (risk/device columns). */
export const getOrgDetails = cache(async (): Promise<Record<string, OrgDetail>> => {
  const rows = await prisma.organization.findMany({ include: { contacts: true, devices: true } });
  return Object.fromEntries(rows.map((o) => [o.id, toDetail(o)]));
});

/** Active audits = not approved/cancelled. */
export const getActiveAuditCount = cache(
  async (): Promise<number> =>
    prisma.audit.count({ where: { status: { notIn: ["approved", "cancelled"] } } }),
);

import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Sector } from "@/lib/types/entities";

export const getSectors = cache(
  async (): Promise<Sector[]> =>
    prisma.sector.findMany({ orderBy: { name: "asc" } }),
);

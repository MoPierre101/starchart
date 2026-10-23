import { PrismaPg } from "@prisma/adapter-pg";
import { DB } from "../db";
import { PrismaClient } from "../prisma/generated/client";

// One Prisma client for the whole service, kept on globalThis so it is only created once.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: DB.connectionString }),
  });

globalForPrisma.prisma = prisma;

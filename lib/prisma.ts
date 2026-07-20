import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as any;

async function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function getPrisma() {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = await createPrismaClient();
  }
  return globalForPrisma.__prisma;
}

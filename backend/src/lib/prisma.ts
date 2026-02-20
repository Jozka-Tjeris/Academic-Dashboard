import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { logger } from "./logger";

declare global {
  var prisma: PrismaClient<Prisma.PrismaClientOptions, 'error' | 'warn'> | undefined;
}

// Initialize the pool and adapter
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: true }
});
const adapter = new PrismaPg(pool);

// Define the log configuration separately with 'as const'
const logLevels = [
  { emit: 'event', level: 'error' },
  { emit: 'stdout', level: 'warn' },
] as const;

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: logLevels as unknown as Prisma.LogDefinition[],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Now 'error' is assignable because Prisma knows it's an event
prisma.$on("error", (e) => {
  logger.error({ err: e }, "Prisma error");
});

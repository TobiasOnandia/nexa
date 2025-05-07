import { PrismaClient } from "@/generated/prisma";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prisma =
  globalThis.prismaGlobal ??
  (() => {
    const newPrismaClient = new PrismaClient();
    return newPrismaClient;
  })();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
export default prisma;

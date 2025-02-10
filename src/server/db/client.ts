import { PrismaClient } from "@prisma/client";

declare global {
  // Prevents multiple instances in development mode (Hot Reloading)
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

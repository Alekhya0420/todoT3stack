import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/api/root";
import { prisma } from "../../../server/db/client";

export default createNextApiHandler({
  router: appRouter,
  createContext: () => ({ prisma }),
});

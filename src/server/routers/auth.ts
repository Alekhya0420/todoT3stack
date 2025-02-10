import { z } from "zod";
import { router, publicProcedure } from '../api/trpc'
import { prisma } from "../db/client";


export const authRouter = router({
  registerUser: publicProcedure
    .input(z.object({
      username: z.string().min(3),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { username: input.username }
      });
      if (existingUser) {
        throw new Error("Username already in use.");
      }

      return await prisma.user.create({
        data: { username: input.username, password: input.password },
      });
    }),

  loginUser: publicProcedure
    .input(z.object({
      username: z.string().min(3),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({ where: { username: input.username } });
      if (!user || user.password !== input.password) {
        throw new Error("Invalid email or password.");
      }

      return { message: "Login successful", userId: user.id };
    }),

    logoutUser: publicProcedure.mutation(async () => {
      return { message: "Logout successful" };
    }),
});

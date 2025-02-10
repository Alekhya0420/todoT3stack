import { router } from "./trpc";
import { todoRouter } from "./todo";
import {authRouter} from "../routers/auth";

export const appRouter = router({
  todo: todoRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

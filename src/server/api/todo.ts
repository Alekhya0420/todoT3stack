// import { z } from "zod";
// import { router, publicProcedure } from "./trpc";
// import { prisma } from "../db/client";

// export const todoRouter = router({
  
//   getTodos: publicProcedure
//     .input(z.object({ userId: z.string().optional()}))
//     .query(async ({ input }) => {
//       return await prisma.todo.findMany({
//         where: { userId: input.userId },
//       });
//     }),

  
//   addTodo: publicProcedure
//     .input(z.object({ title: z.string().min(1), text: z.string().min(1), userId: z.string() }))
//     .mutation(async ({ input }) => {
//       return await prisma.todo.create({
//         data: { title: input.title, text: input.text, completed: false, userId: input.userId },
//       });
//     }),

//   toggleTodo: publicProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       const todo = await prisma.todo.findUnique({ where: { id: input.id } });
//       if (!todo) throw new Error("Todo not found");

//       return await prisma.todo.update({
//         where: { id: input.id },
//         data: { completed: !todo.completed },
//       });
//     }),


//   deleteTodo: publicProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       return await prisma.todo.delete({ where: { id: input.id } });
//     }),
// });


import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { prisma } from "../db/client";

export const todoRouter = router({
  getTodos: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input }) => {
      return await prisma.todo.findMany({
        where: { userId: input.userId },
      });
    }),

  addTodo: publicProcedure
    .input(z.object({ title: z.string().min(1), text: z.string().min(1), userId: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.todo.create({
        data: { title: input.title, text: input.text, completed: false, userId: input.userId },
      });
    }),

  toggleTodo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const todo = await prisma.todo.findUnique({ where: { id: input.id } });
      if (!todo) throw new Error("Todo not found");

      return await prisma.todo.update({
        where: { id: input.id },
        data: { completed: !todo.completed },
      });
    }),

  deleteTodo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.todo.delete({ where: { id: input.id } });
    }),

  // Edit Todo Function
  editTodo: publicProcedure
    .input(z.object({ id: z.string(), title: z.string().min(1), text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const todo = await prisma.todo.findUnique({ where: { id: input.id } });
      if (!todo) throw new Error("Todo not found");

      return await prisma.todo.update({
        where: { id: input.id },
        data: { title: input.title, text: input.text },
      });
    }),
});

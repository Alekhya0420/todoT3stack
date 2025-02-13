import { z } from "zod";
import {router,publicProcedure} from "./trpc";
import {prisma} from "../db/client";

export const todoRouter = router({
  getTodos: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input }) => {
      return await prisma.todo.findMany({
        where: { userId: input.userId },
      });
    }),

    getAllUsersWithTodos: publicProcedure.query(async()=>{
      return await prisma.user.findMany({
        include: {
          todos: true, 
        },
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
        data: { 
          completed: !todo.completed,
          finishedTime: !todo.completed ? new Date() : null, 
         },
      });
    }),

  deleteTodo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.todo.delete({ where: { id: input.id } });
    }),

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


  reorderTodos: publicProcedure
  .input(
    z.object({
      userId: z.string(),
      orderedTodoIds: z.array(z.string()),
    })
  )
  .mutation(async ({ input }) => {
    const { userId, orderedTodoIds } = input;
    const todos = await prisma.todo.findMany({
      where: { userId },
      select: { id: true },
    });

    const todoIdsSet = new Set(todos.map((todo) => todo.id));
    if (!orderedTodoIds.every((id) => todoIdsSet.has(id))) {
      throw new Error("Invalid todo IDs");
    }

    for (let i = 0; i < orderedTodoIds.length; i++) {
      await prisma.todo.update({
        where: { id: orderedTodoIds[i] },
        data: { order: i }, 
      });
    }

    return { message: "Todos reordered successfully" };
  }),

});

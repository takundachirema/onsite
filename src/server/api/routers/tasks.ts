/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import {
  taskSchema,
  taskUpdateSchema,
  taskGetSchema,
  idSchema,
} from "$/src/server/api/schemas/tasks";
import { type Response } from "$/src/utils/types";

export const tasksRouter = createTRPCRouter({
  //get all tasks
  get: publicProcedure.input(taskGetSchema).query(async ({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "tasks obtained",
      data: {},
    };

    const tasks = await ctx.db.task.findMany({
      where: taskGetSchema.parse(input),
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    return { ...response, ...{ data: tasks } };
  }),

  //get task by id
  getOne: publicProcedure.input(idSchema).query(({ input, ctx }) => {
    return ctx.db.task.findUnique({
      where: idSchema.parse(input),
    });
  }),

  //create task
  createTask: publicProcedure
    .input(taskSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "task created",
        data: {},
      };

      const userIds = input.userIds ?? [];

      const taskData = {
        name: input.name,
        description: input.description,
        projectId: input.projectId,
        dueDate: input.dueDate,
        users: { connect: userIds.map((userId) => ({ id: userId })) },
      };

      const task = await ctx.db.task.create({
        data: taskData,
        include: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });

      return { ...response, ...{ data: task } };
    }),

  //update task
  updateTask: publicProcedure
    .input(taskUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "task updated",
        data: {},
      };

      const userIds = input.userIds
        ? { users: { set: input.userIds.map((userId) => ({ id: userId })) } }
        : {};

      delete input.userIds;
      const task = await ctx.db.task.update({
        where: {
          id: input.id.toString(),
        },
        data: {
          ...(taskUpdateSchema.parse(input) as object),
          ...userIds,
        },
        include: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });

      return { ...response, ...{ data: task } };
    }),

  //delete task
  deleteTask: publicProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "task updated",
        data: {},
      };

      const result = await ctx.db.task.delete({
        where: idSchema.parse(input),
      });

      return { ...response, ...{ data: result } };
    }),
});

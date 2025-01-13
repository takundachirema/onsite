/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import {
  roomSchema,
  roomUpdateSchema,
  roomGetSchema,
  idSchema,
} from "$/src/server/api/schemas/rooms";
import { type Response } from "$/src/utils/types";

export const roomsRouter = createTRPCRouter({
  //get all rooms
  get: publicProcedure.input(roomGetSchema).query(async ({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "rooms obtained",
      data: {},
    };

    const rooms = await ctx.db.room.findMany({
      where: roomGetSchema.parse(input),
      include: {
        tasks: {
          select: {
            id: true,
          },
        },
      },
    });

    return { ...response, ...{ data: rooms } };
  }),

  //get room by id
  getOne: publicProcedure.input(idSchema).query(({ input, ctx }) => {
    return ctx.db.room.findUnique({
      where: idSchema.parse(input),
    });
  }),

  //create room
  createRoom: publicProcedure
    .input(roomSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "room created",
        data: {},
      };

      const taskIds = input.taskIds ?? [];

      const roomData = {
        name: input.name,
        type: input.type,
        projectId: input.projectId,
        dueDate: input.dueDate,
        tasks: { connect: taskIds.map((userId) => ({ id: userId })) },
      };

      const room = await ctx.db.room.create({
        data: roomData,
        include: {
          tasks: {
            select: {
              id: true,
            },
          },
        },
      });

      return { ...response, ...{ data: room } };
    }),

  //update room
  updateRoom: publicProcedure
    .input(roomUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "room updated",
        data: {},
      };

      const taskIds = input.taskIds
        ? { tasks: { set: input.taskIds.map((userId) => ({ id: userId })) } }
        : {};

      delete input.taskIds;
      const room = await ctx.db.room.update({
        where: {
          id: input.id.toString(),
        },
        data: {
          ...(roomUpdateSchema.parse(input) as object),
          ...taskIds,
        },
        include: {
          tasks: {
            select: {
              id: true,
            },
          },
        },
      });

      return { ...response, ...{ data: room } };
    }),

  //delete room
  deleteRoom: publicProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "room deleted",
        data: {},
      };

      const result = await ctx.db.room.delete({
        where: idSchema.parse(input),
      });

      return { ...response, ...{ data: result } };
    }),
});

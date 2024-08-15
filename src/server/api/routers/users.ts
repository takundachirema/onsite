import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import {
  userSchema,
  userUpdateSchema,
  userGetSchema,
  idSchema,
} from "$/src/server/api/schemas/users";
import { type Response } from "$/src/utils/types";

export const usersRouter = createTRPCRouter({
  //get all users
  get: publicProcedure.input(userGetSchema).query(async ({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "users obtained",
      data: {},
    };

    const users = await ctx.db.user.findMany({
      where: idSchema.parse(input),
    });

    return { ...response, ...{ data: users } };
  }),

  //get user by id
  getOne: publicProcedure.input(idSchema).query(async ({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "user obtained",
      data: {},
    };

    const user = await ctx.db.user.findUnique({
      where: idSchema.parse(input),
    });

    return { ...response, ...{ data: user } };
  }),

  //create user
  createUser: publicProcedure
    .input(userSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "user created",
        data: {},
      };

      const user = await ctx.db.user.create({
        data: userSchema.parse(input),
      });

      return { ...response, ...{ data: user } };
    }),

  //update user
  updateUser: publicProcedure
    .input(userUpdateSchema)
    .mutation(({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "user updated",
        data: {},
      };

      const user = ctx.db.user.update({
        where: {
          id: input.id.toString(),
        },
        data: userUpdateSchema.parse(input),
      });

      return { ...response, ...{ data: user } };
    }),

  //delete user
  deleteUser: publicProcedure.input(idSchema).mutation(({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "user deleted",
      data: {},
    };

    const user = ctx.db.user.delete({
      where: idSchema.parse(input),
    });

    return { ...response, ...{ data: user } };
  }),
});

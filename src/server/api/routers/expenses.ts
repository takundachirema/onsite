/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import {
  expenseSchema,
  expenseUpdateSchema,
  expenseGetSchema,
  idSchema,
} from "$/src/server/api/schemas/expenses";
import { type Response } from "$/src/utils/types";

export const expensesRouter = createTRPCRouter({
  //get all expenses
  get: publicProcedure.input(expenseGetSchema).query(async ({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "expenses obtained",
      data: {},
    };

    const expenses = await ctx.db.expense.findMany({
      where: expenseGetSchema.parse(input),
      include: {
        task: {
          select: {
            name: true,
          },
        },
      },
    });

    return { ...response, ...{ data: expenses } };
  }),

  //get expense by id
  getOne: publicProcedure.input(idSchema).query(({ input, ctx }) => {
    return ctx.db.expense.findUnique({
      where: idSchema.parse(input),
    });
  }),

  //create expense
  createExpense: publicProcedure
    .input(expenseSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "expense created",
        data: {},
      };

      const expense = await ctx.db.expense.create({
        data: expenseSchema.parse(input),
      });

      return { ...response, ...{ data: expense } };
    }),

  //update expense
  updateExpense: publicProcedure
    .input(expenseUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "expense updated",
        data: {},
      };

      const expense = await ctx.db.expense.update({
        where: {
          id: input.id.toString(),
        },
        data: expenseUpdateSchema.parse(input),
        include: {
          task: {
            select: {
              name: true,
            },
          },
        },
      });

      return { ...response, ...{ data: expense } };
    }),

  //delete expense
  deleteExpense: publicProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "expense deleted",
        data: {},
      };

      const result = await ctx.db.expense.delete({
        where: idSchema.parse(input),
      });

      return { ...response, ...{ data: result } };
    }),
});

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import {
  transactionSchema,
  transactionUpdateSchema,
  transactionGetSchema,
  idSchema,
} from "$/src/server/api/schemas/transactions";
import { type Response } from "$/src/utils/types";

export const transactionsRouter = createTRPCRouter({
  //get all transactions
  get: publicProcedure
    .input(transactionGetSchema)
    .query(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "transactions obtained",
        data: {},
      };

      const transactions = await ctx.db.transaction.findMany({
        where: transactionGetSchema.parse(input),
      });

      return { ...response, ...{ data: transactions } };
    }),

  //get transaction by id
  getOne: publicProcedure.input(idSchema).query(({ input, ctx }) => {
    return ctx.db.transaction.findUnique({
      where: idSchema.parse(input),
    });
  }),

  //create transaction
  createTransaction: publicProcedure
    .input(transactionSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "transaction created",
        data: {},
      };

      const transaction = await ctx.db.transaction.create({
        data: transactionSchema.parse(input),
      });

      return { ...response, ...{ data: transaction } };
    }),

  //update transaction
  updateTransaction: publicProcedure
    .input(transactionUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "transaction updated",
        data: {},
      };

      const transaction = await ctx.db.transaction.update({
        where: {
          id: input.id.toString(),
        },
        data: transactionUpdateSchema.parse(input),
      });

      return { ...response, ...{ data: transaction } };
    }),

  //delete transaction
  deleteTransaction: publicProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "transaction deleted",
        data: {},
      };

      const result = await ctx.db.transaction.delete({
        where: idSchema.parse(input),
      });

      return { ...response, ...{ data: result } };
    }),
});

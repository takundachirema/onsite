/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  PrismaClient,
  type StatusCode,
  type Project,
  type Task,
  type Transaction,
} from "@prisma/client";

import { env } from "$/src/env";

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    query: {
      project: {
        async create({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create the project
            args.data.progressUpdate = false;
            const createResult = await tx.project.create(args);

            // 2. Create status object
            await tx.status.create({
              data: {
                projectId: createResult.id,
                status: createResult.status,
                dateTime: new Date(),
                date: new Date().toDateString(),
              },
            });

            return createResult;
          });

          return new Promise<Project>((resolve) => {
            resolve(result);
          });
        },
        async update({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create status object if it's in the args
            if (args.data.status) {
              const project = await tx.project.findUnique({
                where: args.where,
              });
              await tx.status.create({
                data: {
                  projectId: project!.id,
                  status: args.data.status as StatusCode,
                  previousStatus: project!.status,
                  dateTime: new Date(),
                  date: new Date().toDateString(),
                },
              });
            }

            // 2. Update the project
            args.data.progressUpdate = false;
            const updateResult = await tx.project.update(args);

            return updateResult;
          });

          return new Promise<Project>((resolve) => {
            resolve(result);
          });
        },
      },
      task: {
        async create({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create the task
            args.data.progressUpdate = false;
            const createResult = await tx.task.create(args);

            // 2. Create status object
            await tx.status.create({
              data: {
                projectId: createResult.projectId,
                status: createResult.status,
                taskId: createResult.id,
                dateTime: new Date(),
                date: new Date().toDateString(),
              },
            });

            return createResult;
          });

          return new Promise<Task>((resolve) => {
            resolve(result);
          });
        },
        async update({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create status object if it's in the args
            if (args.data.status) {
              const task = await tx.task.findUnique({
                where: args.where,
              });
              await tx.status.create({
                data: {
                  projectId: task!.projectId,
                  status: args.data.status as StatusCode,
                  previousStatus: task!.status,
                  taskId: task!.id,
                  dateTime: new Date(),
                  date: new Date().toDateString(),
                },
              });
            }

            // 2. Update the task
            args.data.progressUpdate = false;
            const updateResult = await tx.task.update(args);

            // 3. Update project and rooms with this task
            await progressUpdate(tx as never, "project", updateResult);
            await progressUpdate(tx as never, "room", updateResult);

            return updateResult;
          });

          return new Promise<Task>((resolve) => {
            resolve(result);
          });
        },
      },
      transaction: {
        async create({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create the transaction
            args.data.progressUpdate = false;
            const createResult = await tx.transaction.create(args);

            // 2. Update expense record
            await expenseUpdate(tx as never, createResult);

            return createResult;
          });

          return new Promise<Transaction>((resolve) => {
            resolve(result);
          });
        },
        async update({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Update the transaction
            args.data.progressUpdate = false;
            const updateResult = await tx.transaction.update(args);

            // 2. Update expense record
            await expenseUpdate(tx as never, updateResult);

            return updateResult;
          });

          return new Promise<Transaction>((resolve) => {
            resolve(result);
          });
        },
        async delete({ model, operation, args, query }) {
          await prisma.$transaction(async (tx) => {
            // 1. First update it so that it's the same as deleting it
            // We can't just delete currently because we cannot pass the data which stops the recursion
            const updateRecord = await tx.transaction.update({
              where: args.where,
              data: { quantity: 0, price: 0 },
            });

            // 2. Update expense record
            await expenseUpdate(tx as never, updateRecord);
          });

          return query(args);
        },
      },
      expense: {
        async update({ model, operation, args, query }) {
          // stop infinite recursion
          if (args.data.cost) {
            args.data.updatedTime = new Date();
            args.data.updatedDate = new Date().toDateString();
          }
          return query(args);
        },
      },
    },
    result: {
      expense: {
        estimateCost: {
          needs: { estimatePrice: true, estimateQty: true },
          compute(expense) {
            return expense.estimatePrice * expense.estimateQty;
          },
        },
        cost: {
          needs: { price: true, quantity: true },
          compute(expense) {
            return (expense.price ?? 0) * (expense.quantity ?? 0);
          },
        },
      },
    },
  });

  /**
   * Updates the progress
   * @param tx
   * @param task
   * @returns
   */
  const progressUpdate = async (
    tx: typeof prisma,
    modelType: "project" | "room",
    task: Task,
  ) => {
    const findArgs = {
      where: { tasks: { some: { id: task.id } } },
    };

    const models =
      modelType === "project"
        ? await tx.project.findMany(findArgs)
        : await tx.room.findMany(findArgs);

    for (const model of models) {
      const tasks = await tx.task.findMany({
        where: { projectId: model?.id },
      });

      if (tasks.length === 0) {
        return;
      }

      /**
       * doneCount is used to update the progress field
       * inProgressCount is used to move project into progress when a task starts
       */
      let doneCount = 0;
      let inProgressCount = 0;
      tasks.map((task) => {
        if (task.status === "done" || task.status === "approved") doneCount++;
        if (task.status !== "todo") inProgressCount++;
      });

      const progressPercentage = (doneCount / tasks.length) * 100;

      const updateArgs = {
        where: {
          id: model?.id,
        },
        data: {
          ...{ progress: progressPercentage },
          ...(inProgressCount > 0 && model.status === "todo"
            ? { status: "inprogress" as StatusCode }
            : {}),
        },
      };

      modelType === "project"
        ? await tx.project.update(updateArgs)
        : await tx.room.update(updateArgs);
    }
  };

  const expenseUpdate = async (tx: typeof prisma, transaction: Transaction) => {
    const transactions = await tx.transaction.findMany({
      where: { expenseId: transaction.expenseId },
    });

    const [quantity, cost] = transactions.reduce(
      ([quantity, cost], transaction) => [
        quantity + transaction.quantity,
        cost + transaction.quantity * transaction.price,
      ],
      [0, 0],
    );

    const avgPrice = cost / quantity;

    await tx.expense.update({
      where: { id: transaction.expenseId },
      data: {
        quantity: quantity,
        price: avgPrice,
        cost: cost,
      },
    });
  };

  return prisma;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

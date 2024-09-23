/* eslint-disable @typescript-eslint/no-misused-promises */
import { Prisma, PrismaClient, type Task } from "@prisma/client";

import { env } from "$/src/env";

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    query: {
      task: {
        async update({ model, operation, args, query }) {
          //
          if (args.data.progressUpdate === false) {
            return query(args);
          }
          const result = await prisma.$transaction(async (tx) => {
            // 1. Update the task
            args.data.progressUpdate = false;
            const updateResult = await tx.task.update(args);

            // 2. Update project and rooms with this task
            await progressUpdate(tx as never, "project", updateResult);
            await progressUpdate(tx as never, "room", updateResult);

            return updateResult;
          });

          return new Promise<Task>((resolve) => {
            resolve(result);
          });
        },
      },
    },
    result: {
      expense: {
        estimateCost: {
          needs: { estimatePrice: true, estimateQty: true },
          compute(expense) {
            return (expense.estimatePrice * expense.estimateQty).toFixed(2);
          },
        },
        cost: {
          needs: { price: true, quantity: true },
          compute(expense) {
            return ((expense.price ?? 0) * (expense.quantity ?? 0)).toFixed(2);
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

      let doneCount = 0;
      tasks.map((task) => {
        if (task.status === "done" || task.status === "approved") doneCount++;
      });

      const progressPercentage = (doneCount / tasks.length) * 100;

      const updateArgs = {
        where: {
          id: model?.id,
        },
        data: {
          progress: progressPercentage,
        },
      };

      modelType === "project"
        ? await tx.project.update(updateArgs)
        : await tx.room.update(updateArgs);
    }
  };

  return prisma;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

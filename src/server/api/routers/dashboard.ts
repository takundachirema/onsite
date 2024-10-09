/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import { type Response } from "$/src/utils/types";
import { Status } from "@prisma/client";
import {
  expensesDataSchema,
  statusesDataSchema,
  tasksDataSchema,
} from "../schemas/dashboard";
import * as _ from "lodash";

export const dashboardRouter = createTRPCRouter({
  getExpensesData: publicProcedure
    .input(expensesDataSchema)
    .query(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "expenses data obtained",
        data: {},
      };

      const expenses = await ctx.db.expense.findMany({
        where: expensesDataSchema.parse(input),
      });

      const totalEstimateCost = _.sumBy(expenses, "estimateCost");
      const totalCost = _.sumBy(expenses, "cost");

      const data = _.chain(expenses)
        .groupBy("type")
        .map((expenses, type) => {
          const estimateCost = _.sumBy(expenses, "estimateCost");
          const cost = _.sumBy(expenses, "cost");

          return {
            type: type,
            estimateCost: estimateCost,
            cost: cost,
            estimateCostPercentage: (estimateCost / totalEstimateCost) * 100,
            costPercentage: (cost / totalCost) * 100,
          };
        })
        .value();

      return { ...response, ...{ data: data } };
    }),

  getTasksData: publicProcedure
    .input(tasksDataSchema)
    .query(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "tasks data obtained",
        data: {},
      };

      const tasks = await ctx.db.task.findMany({
        where: tasksDataSchema.parse(input),
      });

      let totalPlannedApproved = 0;

      const data = _.chain(tasks)
        .groupBy("status")
        .map((tasks, status) => {
          // count tasks that are supposed to be approved
          let plannedApproved = 0;
          tasks.map((task) => {
            if (new Date() > task.dueDate) plannedApproved++;
          });

          // add to total planned approved
          totalPlannedApproved += plannedApproved;

          return {
            status: status,
            count: tasks.length,
            plannedCount: tasks.length - plannedApproved,
          };
        })
        .value();

      // update the planned approved tasks count
      const doneStatusData = data.find(
        (statusData) => statusData.status === "approved",
      );
      if (doneStatusData) {
        doneStatusData.plannedCount = totalPlannedApproved;
      } else {
        data.push({
          status: "approved",
          count: 0,
          plannedCount: totalPlannedApproved,
        });
      }

      return { ...response, ...{ data: data } };
    }),

  getStatusData: publicProcedure
    .input(statusesDataSchema)
    .query(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "statuses data obtained",
        data: {},
      };

      const statuses = await ctx.db.status.findMany({
        where: statusesDataSchema.parse(input),
      });

      return { ...response, ...{ data: statuses } };
    }),

  getTaskProjectionsData: publicProcedure
    .input(tasksDataSchema)
    .query(async ({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "statuses data obtained",
        data: {},
      };

      // get the project start date
      const projectStatus = await ctx.db.status.findFirst({
        orderBy: {
          dateTime: "asc",
        },
        where: {
          taskId: null,
          projectId: input.projectId,
          status: "inprogress",
        },
      });

      // get the task statuses
      const statuses = await ctx.db.status.findMany({
        orderBy: {
          dateTime: "asc",
        },
        where: {
          ...statusesDataSchema.parse(input),
          ...{
            OR: [{ status: "approved" }, { previousStatus: "approved" }],
            taskId: { not: null },
          },
        },
      });

      statuses.map((status) => {
        status.projectStartDate = projectStatus?.dateTime.toISOString() ?? "";
      });

      return { ...response, ...{ data: statuses } };
    }),
});

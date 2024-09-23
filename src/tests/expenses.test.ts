/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCaller } from "$/src/server/api/root";
import { cleanUpDatabase, createTestContext } from "$/src/utils/tests/tests";
import { type Project } from "@prisma/client";
import { beforeEach, describe, test, expect } from "vitest";

let ctx: any;

describe("tasks", () => {
  let projectData: Project & { users: { id: string }[] };

  beforeEach(async () => {
    ctx = await createTestContext(true);
    await cleanUpDatabase(ctx.db);

    // create project
    const caller = createCaller(ctx);
    const createProjectResponse = await caller.projects.createProject({
      name: "Project 1",
      dueDate: new Date(),
    });
    projectData = createProjectResponse.data;
  });

  test("create a task expense", async () => {
    const ctx = await createTestContext(true);
    const caller = createCaller(ctx);

    const createTaskResponse = await caller.tasks.createTask({
      name: "Paint",
      description: "Paint all the walls of the house",
      dueDate: new Date(),
      projectId: projectData.id,
    });
    const taskData = createTaskResponse.data;

    expect(taskData.name).toEqual("Paint");

    const createExpenseResponse = await caller.expenses.createExpense({
      projectId: projectData.id,
      name: "Deluxe Paint",
      type: "material",
      taskId: taskData.id,
      estimateQty: 1,
      estimatePrice: 100,
    });
    let expenseData = createExpenseResponse.data;
    expect(expenseData.name).toEqual("Deluxe Paint");

    const updateExpenseResponse = await caller.expenses.updateExpense({
      id: expenseData.id,
      quantity: 2,
      estimatePrice: 70,
    });
    expenseData = updateExpenseResponse.data;
    expect(expenseData.quantity).toEqual(2);
  });
});

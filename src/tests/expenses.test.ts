/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCaller } from "$/src/server/api/root";
import { cleanUpDatabase, createTestContext } from "$/src/utils/tests/tests";
import { type Project } from "@prisma/client";
import { beforeEach, describe, test, expect } from "vitest";

let ctx: any;

describe("expenses", () => {
  let projectData: Project & { users: { id: string }[] };

  beforeEach(async () => {
    ctx = await createTestContext(true);
    await cleanUpDatabase(ctx.db);

    // create project
    const caller = createCaller(ctx);
    const createProjectResponse = await caller.projects.createProject({
      name: "Project 1",
      dueDate: new Date(),
      currency: "ZAR",
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

    // create a transaction against this expense
    let createTransactionResponse = await caller.transactions.createTransaction(
      {
        projectId: projectData.id,
        expenseId: expenseData.id,
        quantity: 2,
        price: 70,
        date: new Date(),
        vendor: "Bucco",
      },
    );
    let transactionData = createTransactionResponse.data;
    expect(transactionData.vendor).toEqual("Bucco");

    let expenseResponse = await caller.expenses.getOne({
      id: expenseData.id,
    });
    expenseData = expenseResponse!;
    expect(expenseData.quantity).toEqual(2);
    expect(expenseData.price).toEqual(70);

    // Create another transaction. The expense qty and cost fields should update
    createTransactionResponse = await caller.transactions.createTransaction({
      projectId: projectData.id,
      expenseId: expenseData.id,
      quantity: 3,
      price: 65,
      date: new Date(),
      vendor: "Bucco",
    });
    transactionData = createTransactionResponse.data;
    expect(transactionData.vendor).toEqual("Bucco");

    expenseResponse = await caller.expenses.getOne({
      id: expenseData.id,
    });
    expenseData = expenseResponse!;
    expect(expenseData.quantity).toEqual(5);
    expect(expenseData.price).toEqual(67);

    // Delete a transaction. Expense qty and cost should go back to normal
    await caller.transactions.deleteTransaction({
      id: transactionData.id,
    });

    expenseResponse = await caller.expenses.getOne({
      id: expenseData.id,
    });
    expenseData = expenseResponse!;
    expect(expenseData.quantity).toEqual(2);
    expect(expenseData.price).toEqual(70);
  });
});

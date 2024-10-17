/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCaller } from "$/src/server/api/root";
import { cleanUpDatabase, createTestContext } from "$/src/utils/tests/tests";
import { type Project } from "@prisma/client";
import exp from "node:constants";
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
      startDate: new Date(),
      dueDate: new Date(),
      currency: "ZAR",
      currencySymbol: "R",
    });
    projectData = createProjectResponse.data;
  });

  test("create a task", async () => {
    const ctx = await createTestContext(true);
    const caller = createCaller(ctx);

    const createTaskResponse = await caller.tasks.createTask({
      name: "Paint",
      description: "Paint all the walls of the house",
      dueDate: new Date(),
      projectId: projectData.id,
    });
    const taskData = createTaskResponse.data;

    // check that the status has been created
    const statusResponse = await caller.dashboard.getStatusData({
      taskId: taskData.id,
    });

    expect(taskData.name).toEqual("Paint");
    expect(statusResponse.data[0]?.status).toEqual("todo");
  });

  test("update a task", async () => {
    const ctx = await createTestContext(true);
    const caller = createCaller(ctx);

    let createTaskResponse = await caller.tasks.createTask({
      name: "Paint",
      description: "Paint all the walls of the house",
      dueDate: new Date(),
      projectId: projectData.id,
    });
    let taskData = createTaskResponse.data;
    expect(taskData.name).toEqual("Paint");

    createTaskResponse = await caller.tasks.createTask({
      name: "Demolish",
      description: "Demolish walls",
      dueDate: new Date(),
      projectId: projectData.id,
    });
    taskData = createTaskResponse.data;
    expect(taskData.name).toEqual("Demolish");

    // Update the task to done - We expect the project progress to update to 50% complete
    const updateTaskResponse = await caller.tasks.updateTask({
      id: taskData.id,
      status: "done",
    });
    taskData = updateTaskResponse.data;

    expect(taskData.status).toEqual("done");

    const projectResponse = await caller.projects.getOne({
      id: projectData.id,
    });
    expect(projectResponse?.progress).toEqual(50);
    expect(projectResponse?.status).toEqual("inprogress");

    // check that the statuses have been created
    let statusResponse = await caller.dashboard.getStatusData({
      projectId: projectData.id,
    });
    expect(statusResponse.data.length).toEqual(5);

    statusResponse = await caller.dashboard.getStatusData({
      taskId: taskData.id,
    });
    expect(statusResponse.data.length).toEqual(2);
    expect(statusResponse.data[1]?.status).toEqual("done");
  });
});

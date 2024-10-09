/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCaller } from "$/src/server/api/root";
import { cleanUpDatabase, createTestContext } from "$/src/utils/tests/tests";
import { type Project } from "@prisma/client";
import { beforeEach, describe, test, expect, afterEach, vi } from "vitest";

let ctx: any;

describe("dashboard", () => {
  let projectData: Project & { users: { id: string }[] };

  beforeEach(async () => {
    vi.useFakeTimers();

    ctx = await createTestContext(true);
    await cleanUpDatabase(ctx.db);

    // create project
    const caller = createCaller(ctx);
    const createProjectResponse = await caller.projects.createProject({
      name: "Project 1",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60_000),
      currency: "ZAR",
    });
    projectData = createProjectResponse.data;
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  test("get task status data", async () => {
    const ctx = await createTestContext(true);
    const caller = createCaller(ctx);

    // create task 1
    let createTaskResponse = await caller.tasks.createTask({
      name: "Paint",
      description: "Paint all the walls of the house",
      dueDate: new Date(Date.now() - 24 * 60 * 60_000),
      projectId: projectData.id,
    });
    const taskData = createTaskResponse.data;

    const updateTaskResponse = await caller.tasks.updateTask({
      id: taskData.id,
      status: "approved",
    });

    // create task 2
    createTaskResponse = await caller.tasks.createTask({
      name: "Plaster",
      description: "Plaster all the walls of the house",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60_000),
      projectId: projectData.id,
    });

    // get task dashboard data
    const tasksDataResponse = await caller.dashboard.getTasksData({
      projectId: projectData.id,
    });
    const tasksData = tasksDataResponse.data;

    expect(tasksData.find((data) => data.status === "approved")?.count).toEqual(
      1,
    );
    expect(
      tasksData.find((data) => data.status === "approved")?.plannedCount,
    ).toEqual(2);
  });

  test("get task projections", async () => {
    const ctx = await createTestContext(true);
    const caller = createCaller(ctx);

    // create tasks
    for (let i = 10; i > 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60_000);
      vi.setSystemTime(date);

      const createTaskResponse = await caller.tasks.createTask({
        name: "Paint",
        description: "Paint all the walls of the house",
        dueDate: new Date(),
        projectId: projectData.id,
      });
      const taskData = createTaskResponse.data;

      await caller.tasks.updateTask({
        id: taskData.id,
        status: "approved",
      });

      if (i < 6 && i >= 4) {
        await caller.tasks.updateTask({
          id: taskData.id,
          status: "done",
        });
      }

      vi.useRealTimers();
    }

    // get task dashboard data
    const tasksDataResponse = await caller.dashboard.getTaskProjectionsData({
      projectId: projectData.id,
    });
    const tasksData = tasksDataResponse.data;

    expect(tasksData.length).toEqual(12);
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCaller } from "$/src/server/api/root";
import { cleanUpDatabase, createTestContext } from "$/src/utils/tests/tests";
import { beforeEach, describe, test, expect } from "vitest";

let ctx: any;

describe("projects", () => {
  beforeEach(async () => {
    ctx = await createTestContext(true);
    await cleanUpDatabase(ctx.db);
  });

  test("create a project", async () => {
    const ctx = await createTestContext(true);

    const caller = createCaller(ctx);
    const createProjectResponse = await caller.projects.createProject({
      name: "Project 1",
      dueDate: new Date(),
    });
    const projectData = createProjectResponse.data;

    expect((await projectData).name).toEqual("Project 1");
  });
});

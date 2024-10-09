/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCaller } from "$/src/server/api/root";
import { cleanUpDatabase, createTestContext } from "$/src/utils/tests/tests";
import { type Project } from "@prisma/client";
import { beforeEach, describe, test, expect } from "vitest";

let ctx: any;

describe("rooms", () => {
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

  test("create a room", async () => {
    const ctx = await createTestContext(true);
    const caller = createCaller(ctx);

    const createRoomResponse = await caller.rooms.createRoom({
      name: "Kitchen",
      type: "kitchen",
      dueDate: new Date(),
      projectId: projectData.id,
    });
    const roomData = createRoomResponse.data;

    expect(roomData.name).toEqual("Kitchen");
  });
});

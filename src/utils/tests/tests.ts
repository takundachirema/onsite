/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { type PrismaClient } from "@prisma/client";
import { randomInt } from "crypto";
import { createInnerTRPCContext } from "$/src/server/api/trpc";
import { faker } from "@faker-js/faker";

export async function cleanUpDatabase(db: PrismaClient) {
  await db.user.deleteMany({});
  await db.task.deleteMany({});
  await db.room.deleteMany({});
  await db.project.deleteMany({});
}

/**
 * Creates a session from a given user supabase
 * @param supabaseUser
 * @returns
 */
export async function createTestContext(createDBUser: boolean) {
  const ctx = await createInnerTRPCContext({
    sessionId: randomInt(10000).toString(),
    userId: randomInt(10000).toString(),
    organizationId: randomInt(10000).toString(),
  });

  if (createDBUser) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    await ctx.db.user.create({
      data: {
        name: faker.person.firstName(),
        email: `${firstName}.${lastName}@test.com`,
        userId: ctx.session!.userId,
        role: "employee",
      },
    });
  }
  return ctx;
}

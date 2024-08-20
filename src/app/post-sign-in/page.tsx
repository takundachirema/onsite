"use server";

import { redirect } from "next/navigation";
import { db } from "$/src/server/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function PostSignIn() {
  const userCount = await db.user.count({
    where: { userId: auth().userId! },
  });

  if (userCount === 0) {
    const orgRole = auth().orgRole;

    const user = await currentUser();
    await db.user.create({
      data: {
        userId: user!.id,
        email: user!.primaryEmailAddress?.emailAddress ?? "",
        name: user!.firstName ?? "",
        role: orgRole === "org:admin" ? "owner" : "employee",
        organizationId: auth().orgId,
      },
    });
  }
  redirect(`/organization/${auth().orgId}/projects`);
}

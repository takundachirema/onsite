/*
  Warnings:

  - The primary key for the `ProjectUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[projectId,userId]` on the table `ProjectUser` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `ProjectUser` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "ProjectUser" DROP CONSTRAINT "ProjectUser_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProjectUser_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUser_projectId_userId_key" ON "ProjectUser"("projectId", "userId");

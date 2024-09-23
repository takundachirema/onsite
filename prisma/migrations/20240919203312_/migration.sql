/*
  Warnings:

  - You are about to drop the column `roomId` on the `Expense` table. All the data in the column will be lost.
  - Made the column `projectId` on table `Expense` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_roomId_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "roomId",
ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "estimateCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "projectId" SET NOT NULL;

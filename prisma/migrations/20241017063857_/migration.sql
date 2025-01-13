/*
  Warnings:

  - You are about to drop the column `updated` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "updated",
ADD COLUMN     "updatedDate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT 'R';

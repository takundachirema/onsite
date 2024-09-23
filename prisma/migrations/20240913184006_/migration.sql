/*
  Warnings:

  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('material', 'labour', 'fee', 'other');

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_roomId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetItem" DROP CONSTRAINT "BudgetItem_budgetId_fkey";

-- DropTable
DROP TABLE "Budget";

-- DropTable
DROP TABLE "BudgetItem";

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "estimateQty" DOUBLE PRECISION NOT NULL,
    "estimatePrice" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "projectId" TEXT,
    "taskId" TEXT,
    "roomId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

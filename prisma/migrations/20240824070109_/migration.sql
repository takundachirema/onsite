/*
  Warnings:

  - Changed the type of `type` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('foyer', 'lounge', 'passage', 'kitchen', 'diningroom', 'bedroom', 'bathroom', 'study', 'basement', 'laundy', 'gym', 'garage', 'other');

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_areaId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "type",
ADD COLUMN     "type" "RoomType" NOT NULL;

-- DropEnum
DROP TYPE "AreaType";

-- CreateTable
CREATE TABLE "_RoomToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomToTask_AB_unique" ON "_RoomToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomToTask_B_index" ON "_RoomToTask"("B");

-- AddForeignKey
ALTER TABLE "_RoomToTask" ADD CONSTRAINT "_RoomToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToTask" ADD CONSTRAINT "_RoomToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `roomId` on the `Task` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('bedroom', 'kitchen', 'bathroom', 'study', 'pool', 'laundy', 'gym', 'garage', 'livingroom', 'foyer', 'walls', 'ceiling', 'roof', 'floor');

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "type",
ADD COLUMN     "type" "AreaType" NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "roomId",
ADD COLUMN     "areaId" TEXT;

-- DropEnum
DROP TYPE "RoomType";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

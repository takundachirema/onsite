/*
  Warnings:

  - The values [completed] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('todo', 'inprogress', 'done', 'approved');
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Room" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Room" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'todo';
ALTER TABLE "Room" ALTER COLUMN "status" SET DEFAULT 'todo';
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'todo';
COMMIT;

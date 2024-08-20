-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'guest', 'employee');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'employee';

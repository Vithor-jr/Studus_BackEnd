/*
  Warnings:

  - You are about to alter the column `duration` on the `StudySession` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "StudySession" ALTER COLUMN "duration" SET DATA TYPE DECIMAL(65,30);

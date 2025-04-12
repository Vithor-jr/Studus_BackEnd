/*
  Warnings:

  - The values [MUITO_FELIZ,MUITO_TRISTE] on the enum `Mood` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Mood_new" AS ENUM ('FELIZ', 'NEUTRO', 'RAIVA', 'TRISTE');
ALTER TABLE "DailyMood" ALTER COLUMN "mood" TYPE "Mood_new" USING ("mood"::text::"Mood_new");
ALTER TYPE "Mood" RENAME TO "Mood_old";
ALTER TYPE "Mood_new" RENAME TO "Mood";
DROP TYPE "Mood_old";
COMMIT;

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'done');

-- AlterTable: agrega status con default "pending", migra los datos desde
-- "done" (true -> done, false -> pending), y recién ahí borra "done" — a
-- mano porque `prisma migrate dev` no genera el paso de backfill solo.
ALTER TABLE "Task" ADD COLUMN "status" "TaskStatus" NOT NULL DEFAULT 'pending';

UPDATE "Task" SET "status" = 'done' WHERE "done" = true;

ALTER TABLE "Task" DROP COLUMN "done";

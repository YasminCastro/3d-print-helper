/*
  Warnings:
  - Added the required column `user_id` to the `filaments` table without a default value. This is not possible if the table is not empty.
*/
-- AlterTable (nullable first, so existing rows can be backfilled)
ALTER TABLE "filaments" ADD COLUMN     "user_id" TEXT;

-- Backfill: assign pre-existing filaments (created before this feature) to the first registered user
UPDATE "filaments" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "createdAt" ASC LIMIT 1) WHERE "user_id" IS NULL;

-- AlterTable (now enforce NOT NULL)
ALTER TABLE "filaments" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "filaments" ADD CONSTRAINT "filaments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

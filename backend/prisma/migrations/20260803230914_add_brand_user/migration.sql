/*
  Warnings:

  - Added the required column `user_id` to the `filament_brands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable (nullable first, so existing rows can be backfilled)
ALTER TABLE "filament_brands" ADD COLUMN     "user_id" TEXT;

-- Backfill: assign pre-existing brands (created before this feature) to the first registered user
UPDATE "filament_brands" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "createdAt" ASC LIMIT 1) WHERE "user_id" IS NULL;

-- AlterTable (now enforce NOT NULL)
ALTER TABLE "filament_brands" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "filament_brands" ADD CONSTRAINT "filament_brands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

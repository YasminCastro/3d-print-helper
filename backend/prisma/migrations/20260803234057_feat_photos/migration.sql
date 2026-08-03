/*
  Warnings:

  - Added the required column `data` to the `journal_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `journal_photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "journal_photos" ADD COLUMN     "data" BYTEA NOT NULL,
ADD COLUMN     "mime_type" TEXT NOT NULL;

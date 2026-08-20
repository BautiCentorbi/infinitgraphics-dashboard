-- CreateEnum
CREATE TYPE "ContentFormat" AS ENUM ('carousel', 'image_post', 'reel', 'video', 'story', 'text', 'other');

-- AlterTable
ALTER TABLE "ContentPiece" ADD COLUMN     "format" "ContentFormat",
ADD COLUMN     "internalNotes" TEXT;

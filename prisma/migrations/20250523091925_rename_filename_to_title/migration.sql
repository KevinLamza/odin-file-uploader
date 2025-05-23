/*
  Warnings:

  - You are about to drop the column `name` on the `files` table. All the data in the column will be lost.
  - Added the required column `title` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "name",
ADD COLUMN     "title" VARCHAR(255) NOT NULL;

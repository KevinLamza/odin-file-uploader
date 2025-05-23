/*
  Warnings:

  - Added the required column `filename` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "filename" VARCHAR(255) NOT NULL;

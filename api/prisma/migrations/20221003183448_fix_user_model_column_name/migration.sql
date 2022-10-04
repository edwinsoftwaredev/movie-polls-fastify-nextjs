/*
  Warnings:

  - You are about to drop the column `emaiVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `emaiVerified`,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;

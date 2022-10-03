/*
  Warnings:

  - Added the required column `emaiVerified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Session` ADD COLUMN `iss` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `emaiVerified` BOOLEAN NOT NULL,
    ADD COLUMN `picture` VARCHAR(191) NULL;

/*
  Warnings:

  - You are about to drop the column `csrfToken` on the `UserSession` table. All the data in the column will be lost.
  - Added the required column `csrfSecret` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserSession` DROP COLUMN `csrfToken`,
    ADD COLUMN `csrfSecret` VARCHAR(191) NOT NULL;

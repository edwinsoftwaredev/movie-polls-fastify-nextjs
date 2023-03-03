-- AlterTable
ALTER TABLE `Poll` ADD COLUMN `votingTokenCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `VotingToken` (
    `id` VARCHAR(191) NOT NULL,
    `pollId` VARCHAR(191) NOT NULL,
    `unused` BOOLEAN NOT NULL DEFAULT false,
    `unshared` BOOLEAN NOT NULL DEFAULT false,
    `label` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VotingToken_pollId_idx`(`pollId`),
    PRIMARY KEY (`id`, `pollId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

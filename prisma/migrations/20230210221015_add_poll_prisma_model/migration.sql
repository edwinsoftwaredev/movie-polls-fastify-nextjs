-- CreateTable
CREATE TABLE `Poll` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `expiresOn` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    INDEX `Poll_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MoviePoll` (
    `pollId` VARCHAR(191) NOT NULL,
    `movieId` INTEGER NOT NULL,
    `voteCount` INTEGER NOT NULL,

    INDEX `MoviePoll_pollId_idx`(`pollId`),
    PRIMARY KEY (`pollId`, `movieId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `UserSession_userId_idx` ON `UserSession`(`userId`);

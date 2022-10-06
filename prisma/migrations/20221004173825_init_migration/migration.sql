-- CreateTable
CREATE TABLE `User` (
    `provider` VARCHAR(191) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `csrfToken` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

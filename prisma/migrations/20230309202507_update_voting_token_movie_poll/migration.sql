-- DropIndex
DROP INDEX `VotingToken_pollId_idx` ON `VotingToken`;

-- AlterTable
ALTER TABLE `VotingToken` ADD COLUMN `movieId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `VotingToken_pollId_movieId_idx` ON `VotingToken`(`pollId`, `movieId`);

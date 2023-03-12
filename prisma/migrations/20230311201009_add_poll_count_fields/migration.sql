-- AlterTable
ALTER TABLE `MoviePoll` ADD COLUMN `voteCount` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Poll` ADD COLUMN `remainingVotingTokenCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `votingTokenCount` INTEGER NOT NULL DEFAULT 0;

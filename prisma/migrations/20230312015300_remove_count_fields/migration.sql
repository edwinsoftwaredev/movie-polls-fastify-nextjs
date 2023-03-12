/*
  Warnings:

  - You are about to drop the column `voteCount` on the `MoviePoll` table. All the data in the column will be lost.
  - You are about to drop the column `remainingVotingTokenCount` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the column `votingTokenCount` on the `Poll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MoviePoll` DROP COLUMN `voteCount`;

-- AlterTable
ALTER TABLE `Poll` DROP COLUMN `remainingVotingTokenCount`,
    DROP COLUMN `votingTokenCount`;

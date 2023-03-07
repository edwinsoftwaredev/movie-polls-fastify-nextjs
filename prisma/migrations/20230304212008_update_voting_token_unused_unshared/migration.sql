-- AlterTable
ALTER TABLE `VotingToken` MODIFY `unused` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `unshared` BOOLEAN NOT NULL DEFAULT true;

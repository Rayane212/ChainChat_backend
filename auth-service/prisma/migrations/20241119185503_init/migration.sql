/*
  Warnings:

  - You are about to drop the `Friend` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Friend` DROP FOREIGN KEY `Friend_userId_fkey`;

-- DropTable
DROP TABLE `Friend`;

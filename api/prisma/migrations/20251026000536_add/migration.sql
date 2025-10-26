/*
  Warnings:

  - You are about to drop the column `Article` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `sellersId` on the `Club` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "Article";

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "categoryId",
DROP COLUMN "sellersId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

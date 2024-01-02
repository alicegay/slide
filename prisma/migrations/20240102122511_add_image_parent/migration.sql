/*
  Warnings:

  - The primary key for the `Image` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ImageToTag" DROP CONSTRAINT "_ImageToTag_A_fkey";

-- AlterTable
ALTER TABLE "Image" DROP CONSTRAINT "Image_pkey",
DROP COLUMN "id",
ADD COLUMN     "parentHash" TEXT,
ADD CONSTRAINT "Image_pkey" PRIMARY KEY ("hash");

-- AlterTable
ALTER TABLE "_ImageToTag" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_parentHash_fkey" FOREIGN KEY ("parentHash") REFERENCES "Image"("hash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToTag" ADD CONSTRAINT "_ImageToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

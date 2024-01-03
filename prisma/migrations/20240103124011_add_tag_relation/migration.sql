/*
  Warnings:

  - You are about to drop the column `text` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Tag` table. All the data in the column will be lost.
  - Made the column `filetype` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "text",
ALTER COLUMN "filetype" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "link";

-- CreateTable
CREATE TABLE "_TagLink" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TagLink_AB_unique" ON "_TagLink"("A", "B");

-- CreateIndex
CREATE INDEX "_TagLink_B_index" ON "_TagLink"("B");

-- AddForeignKey
ALTER TABLE "_TagLink" ADD CONSTRAINT "_TagLink_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagLink" ADD CONSTRAINT "_TagLink_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

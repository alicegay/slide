-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('TAG', 'ARTIST', 'SERIES', 'CHARACTER', 'INFO');

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagType" NOT NULL DEFAULT 'TAG',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "average" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "datetime" TIMESTAMP(3),
    "uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "title" TEXT,
    "description" TEXT,
    "text" TEXT,
    "translation" TEXT,
    "filetype" TEXT,
    "filesize" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagesOnTags" (
    "tagId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "ImagesOnTags_pkey" PRIMARY KEY ("tagId","imageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Image_hash_key" ON "Image"("hash");

-- AddForeignKey
ALTER TABLE "ImagesOnTags" ADD CONSTRAINT "ImagesOnTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagesOnTags" ADD CONSTRAINT "ImagesOnTags_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

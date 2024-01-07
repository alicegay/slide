import { PrismaClient, TagType } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

const typeMap: Record<number, TagType> = {
  0: 'TAG',
  1: 'ARTIST',
  2: 'CHARACTER',
  3: 'SERIES',
  4: 'INFO',
}

type Tag = {
  id: number
  name: string
  type: number
  link: number
}

type Image = {
  id: number
  hash: string
  tags: string
  dt: string
  source: string
  type: string
  size: number
  width: number
  height: number
  average: string
  parent: string
  crc: string
  sha: string
  text_orig: string
  text_tl: string
}

const main = async () => {
  const tags: Tag[] = await fs
    .readFile('./prisma/tags.json', 'utf8')
    .then((tags) => JSON.parse(tags))

  console.log('TAG CREATE...')
  await prisma.tag.createMany({
    data: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      type: typeMap[tag.type],
    })),
  })
  console.log('   ...TAG CREATE DONE')

  let i = 1
  const tagsWithLink = tags.filter((tag) => tag.link !== 0)
  tagsWithLink.forEach(async (tag) => {
    await prisma.tag.update({
      where: {
        id: tag.id,
      },
      data: {
        parents: {
          connect: {
            id: tag.link,
          },
        },
      },
    })
    console.log(
      'TAG UPDATE: ' + tag.id + '   ' + i + ' / ' + tagsWithLink.length,
    )
    i++
  })

  const images: Image[] = await fs
    .readFile('./prisma/images.json', 'utf8')
    .then((images) => JSON.parse(images))

  console.log('IMAGE CREATE...')
  await prisma.image.createMany({
    data: images.map((image) => ({
      hash: image.hash,
      source: image.source,
      average: image.average,
      filesize: image.size,
      filetype: image.type,
      width: image.width,
      height: image.height,
      description: image.text_orig ?? null,
      translation: image.text_tl ?? null,
    })),
  })
  console.log('   ...IMAGE CREATE DONE')

  i = 1
  images.forEach(async (image) => {
    await prisma.$connect()
    await prisma.image
      .update({
        where: {
          hash: image.hash,
        },
        data: {
          tags: {
            connect: image.tags.split(' ').map((tag) => ({ id: Number(tag) })),
          },
          parent: image.parent
            ? {
                connect: { hash: image.parent },
              }
            : {},
        },
      })
      .catch((error) => {
        console.warn('ERROR on IMAGE ' + image.hash)
        console.error(error)
        process.exit(1)
      })
    console.log(
      'IMAGE UPDATE: ' + image.hash + '   ' + i + ' / ' + images.length,
    )
    i++
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

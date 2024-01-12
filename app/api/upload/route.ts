import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import md5 from 'md5'
import { z } from 'zod'
import prisma from '@/prisma/client'
import formatZodError from '@/app/lib/formatZodError'
import sizeOf from 'buffer-image-size'
import sharp from 'sharp'

export const schema = z.object({
  tags: z.string(),
  source: z
    .string()
    .url({ message: 'Source URL is invalid' })
    .or(z.string().length(0)),
  parent: z
    .string()
    .length(32, { message: 'Parent Hash is invalid' })
    .or(z.string().length(0)),
  title: z.string(),
  description: z.string(),
  translation: z.string(),
})

export const POST = async (request: NextRequest) => {
  const formData = await request.formData()

  const file = formData.get('file') as File
  if (!file || (file && file.size === 0))
    return NextResponse.json({ error: 'No files received.' }, { status: 400 })
  const hash = await file.arrayBuffer().then((buffer) => {
    return md5(new Uint8Array(buffer))
  })

  const image = await prisma.image.findUnique({
    where: {
      hash: hash,
    },
  })
  if (image)
    return NextResponse.json(
      { error: 'An image with this hash already exists.' },
      { status: 400 },
    )

  const validation = schema.safeParse({
    tags: formData.get('tags'),
    source: formData.get('source'),
    parent: formData.get('parent'),
    title: formData.get('title'),
    description: formData.get('description'),
    translation: formData.get('translation'),
  })
  if (!validation.success) {
    return NextResponse.json(
      { error: formatZodError(validation.error) },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dimensions = sizeOf(buffer)

  try {
    await writeFile(path.join(process.cwd(), 'public/image/' + hash), buffer)
  } catch (error) {
    console.log('Error occured ', error)
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 })
  }

  await sharp(buffer)
    .resize(448, 448, { fit: 'inside' })
    .webp()
    .toFile(path.join(process.cwd(), 'public/thumbnail/' + hash + '.webp'))

  const tagsArray = formData.get('tags')
    ? (formData.get('tags') as string).trim().split(' ')
    : []
  const tagArray = await prisma.tag.findMany({
    where: {
      OR: tagsArray.map((tag) => ({ name: tag })),
    },
    include: { parents: true },
  })
  const tagParentArray = tagArray
    .filter((tag) => tag.parents.length > 0)
    .flatMap((tag) => tag.parents.map((parent) => parent.name))
  const tags = tagsArray.concat(tagParentArray)

  if (formData.get('parent')) {
    const parentImage = await prisma.image.findUnique({
      where: {
        hash: formData.get('parent') as string,
      },
    })
    if (!parentImage)
      return NextResponse.json(
        { error: 'Parent Image Hash does not exist.' },
        { status: 400 },
      )
  }

  const newImage = await prisma.image.create({
    data: {
      hash: hash,
      average: '', // todo))
      source: formData.get('source')
        ? (formData.get('source') as string)
        : null,
      filetype: file.type.split('/')[1],
      filesize: file.size,
      width: dimensions.width,
      height: dimensions.height,
      tags: {
        connectOrCreate: tags.map((tag: string) => ({
          create: { name: tag },
          where: { name: tag },
        })),
        connect: {
          name: formData.get('explicit') ? 'explicit' : 'safe',
        },
      },
      parent: formData.get('parent')
        ? {
            connect: {
              hash: formData.get('parent') as string,
            },
          }
        : {},
      title: formData.get('title') ? (formData.get('title') as string) : null,
      description: formData.get('description')
        ? (formData.get('description') as string)
        : null,
      translation: formData.get('translation')
        ? (formData.get('translation') as string)
        : null,
    },
  })

  return NextResponse.json(newImage, { status: 201 })
}

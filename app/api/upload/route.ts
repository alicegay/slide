import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import md5 from 'md5'
import { z } from 'zod'
import prisma from '@/prisma/client'
import formatZodError from '@/app/lib/formatZodError'
import sizeOf from 'buffer-image-size'

const schema = z.object({
  tags: z.string(),
  source: z
    .string()
    .url({ message: 'Source URL is invalid' })
    .or(z.string().length(0)),
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

  const tags = formData.get('tags')
    ? (formData.get('tags') as string).split(' ')
    : []

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
    },
  })

  return NextResponse.json(newImage, { status: 201 })
}

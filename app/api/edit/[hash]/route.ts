import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'
import { z } from 'zod'
import formatZodError from '@/app/lib/formatZodError'

const schema = z.object({
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

interface Props {
  params: {
    hash: string
  }
}

export const PATCH = async (request: NextRequest, { params }: Props) => {
  const formData = await request.formData()

  const image = await prisma.image.findUnique({
    where: {
      hash: params.hash,
    },
    include: {
      tags: true,
    },
  })

  if (!image)
    return NextResponse.json(
      { error: 'Image does not exist.' },
      { status: 404 },
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

  const origTags = image.tags.map((tag) => tag.name)
  const explicit = formData.get('explicit') ? 'explicit' : 'safe'

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

  const editedImage = await prisma.image.update({
    where: {
      hash: params.hash,
    },
    data: {
      source: formData.get('source')
        ? (formData.get('source') as string)
        : null,
      tags: {
        connectOrCreate: tags.map((tag: string) => ({
          create: { name: tag },
          where: { name: tag },
        })),
        connect: {
          name: formData.get('explicit') ? 'explicit' : 'safe',
        },
        disconnect: origTags
          .filter((name) => !tags.includes(name) && name !== explicit)
          .map((tag) => ({
            name: tag,
          })),
      },
      parent: formData.get('parent')
        ? {
            connect: {
              hash: formData.get('parent') as string,
            },
          }
        : {
            disconnect: true,
          },
      title: formData.get('title') ? (formData.get('title') as string) : null,
      description: formData.get('description')
        ? (formData.get('description') as string)
        : null,
      translation: formData.get('translation')
        ? (formData.get('translation') as string)
        : null,
    },
  })

  return NextResponse.json(editedImage, { status: 200 })
}

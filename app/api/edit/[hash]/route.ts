import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'
import { schema } from '../../upload/route'
import formatZodError from '@/app/lib/formatZodError'

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

  const tags = formData.get('tags')
    ? (formData.get('tags') as string).split(' ')
    : []

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

  return NextResponse.json({}, { status: 200 })
}

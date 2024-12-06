import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'
import { TagType } from '@prisma/client'

interface Props {
  params: Promise<{
    id: string
  }>
}

export const PATCH = async (request: NextRequest, props: Props) => {
  const params = await props.params;
  const formData = await request.formData()

  const id = Number(params.id)
  const name = formData.get('name') as string
  const type = formData.get('type') as TagType
  const parents = formData.get('parents')
    ? (formData.get('parents') as string).split(' ')
    : []

  const tag = await prisma.tag.findUnique({
    where: {
      id: id,
    },
    include: {
      parents: true,
    },
  })
  if (!tag)
    return NextResponse.json({ error: 'Tag does not exist.' }, { status: 404 })

  const origParents = tag.parents.map((parent) => parent.name)

  const newTag = await prisma.tag.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      type: type,
      parents: {
        connect: parents.map((parent) => ({ name: parent })),
        disconnect: origParents
          .filter((parent) => !parents.includes(parent))
          .map((parent) => ({ name: parent })),
      },
    },
    include: {
      parents: true,
    },
  })

  return NextResponse.json(newTag, { status: 201 })
}

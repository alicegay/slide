import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'
import { TagType } from '@prisma/client'

export const POST = async (request: NextRequest) => {
  const formData = await request.formData()

  const name = formData.get('name') as string
  const type = formData.get('type') as TagType
  const parents = formData.get('parents')
    ? (formData.get('parents') as string).split(' ')
    : []

  const tag = await prisma.tag.findUnique({
    where: {
      name: name,
    },
  })
  if (tag)
    return NextResponse.json(
      { error: 'An tag with this name already exists.' },
      { status: 400 },
    )

  const newTag = await prisma.tag.create({
    data: {
      name: name,
      type: type,
      parents: {
        connect: parents.map((parent) => ({ name: parent })),
      },
    },
    include: {
      parents: true,
    },
  })

  return NextResponse.json(newTag, { status: 201 })
}

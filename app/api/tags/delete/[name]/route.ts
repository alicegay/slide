import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

interface Props {
  params: {
    name: string
  }
}

export const DELETE = async (request: NextRequest, { params }: Props) => {
  const tag = await prisma.tag.findUnique({
    where: {
      name: params.name,
    },
  })

  if (!tag)
    return NextResponse.json({ error: 'Tag does not exist.' }, { status: 404 })

  const deleteTag = await prisma.tag.delete({
    where: {
      name: params.name,
    },
  })

  return new Response(null, { status: 204 })
}

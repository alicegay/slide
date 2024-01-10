import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

interface Props {
  params: {
    name: string
  }
}

export const GET = async (request: NextRequest, { params }: Props) => {
  const tag = await prisma.tag.findUnique({
    where: {
      name: params.name,
    },
    include: {
      parents: true,
    },
  })

  if (!tag)
    return NextResponse.json({ error: 'Tag does not exist.' }, { status: 404 })

  return NextResponse.json(tag, { status: 200 })
}

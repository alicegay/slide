import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

interface Props {
  params: Promise<{
    name: string
  }>
}

export const GET = async (request: NextRequest, props: Props) => {
  const params = await props.params;
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

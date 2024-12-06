import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

interface Props {
  params: Promise<{
    name: string
  }>
}

export const DELETE = async (request: NextRequest, props: Props) => {
  const params = await props.params;
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

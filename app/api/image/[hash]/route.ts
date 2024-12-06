import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

interface Props {
  params: Promise<{
    hash: string
  }>
}

export const GET = async (request: NextRequest, props: Props) => {
  const params = await props.params;
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

  return NextResponse.json(image, { status: 200 })
}

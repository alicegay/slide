import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

interface Props {
  params: {
    hash: string
  }
}

export const GET = async (request: NextRequest, { params }: Props) => {
  const image = await prisma.image.findUnique({
    where: {
      hash: params.hash,
    },
  })

  if (!image)
    return NextResponse.json(
      { error: 'Image does not exist.' },
      { status: 404 },
    )

  return NextResponse.json(image, { status: 200 })
}

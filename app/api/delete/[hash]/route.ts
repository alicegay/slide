import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { unlink } from 'fs/promises'
import prisma from '@/prisma/client'

interface Props {
  params: {
    hash: string
  }
}

export const DELETE = async (request: NextRequest, { params }: Props) => {
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

  const deleteImage = await prisma.image.delete({
    where: {
      hash: params.hash,
    },
  })

  await unlink(path.join(process.cwd(), 'public/image/' + params.hash))

  return new Response(null, { status: 204 })
}

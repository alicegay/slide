import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { unlink } from 'fs/promises'
import prisma from '@/prisma/client'

interface Props {
  params: Promise<{
    hash: string
  }>
}

export const DELETE = async (request: NextRequest, props: Props) => {
  const params = await props.params;
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

  try {
    await unlink(path.join(process.cwd(), 'data/image/' + params.hash))
    await unlink(
      path.join(process.cwd(), 'data/thumbnail/' + params.hash + '.webp'),
    )
  } catch (error) {
    console.warn('Error deleting images')
  }

  return new Response(null, { status: 204 })
}

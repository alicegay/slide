import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFile } from 'fs/promises'
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
    select: {
      filetype: true,
    },
  })

  if (!image) {
    return NextResponse.json(
      { error: 'Image Hash does not exist.' },
      { status: 404 },
    )
  }

  const response = await readFile(
    path.join(process.cwd(), 'data/image/' + params.hash),
  )
    .then((imageBuffer) => {
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: { 'Content-Type': 'image/' + image.filetype },
      })
    })
    .catch(() => {
      return NextResponse.json(
        { error: 'Image does not exist.' },
        { status: 404 },
      )
    })

  return response
}

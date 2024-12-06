import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFile } from 'fs/promises'

interface Props {
  params: Promise<{
    hash: string
  }>
}

export const GET = async (request: NextRequest, props: Props) => {
  const params = await props.params;
  const response = await readFile(
    path.join(process.cwd(), 'data/thumbnail/' + params.hash + '.webp'),
  )
    .then((imageBuffer) => {
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: { 'Content-Type': 'image/webp' },
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

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/client'

export const GET = async (request: NextRequest) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
  const array = tags.map((tag) => tag.name)
  return NextResponse.json(array, { status: 200 })
}

export const dynamic = 'force-dynamic'

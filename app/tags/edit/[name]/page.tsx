import prisma from '@/prisma/client'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    name: string
  }
}

const TagViewPage = async ({ params }: Props) => {
  const tag = await prisma.tag.findUnique({
    where: {
      name: params.name,
    },
  })

  if (!tag && params.name !== 'new') notFound()

  return (
    <div>
      <div>{tag?.id}</div>
      <div>{tag?.name}</div>
      <div>{tag?.type}</div>
    </div>
  )
}

export default TagViewPage

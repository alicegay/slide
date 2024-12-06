import prisma from '@/prisma/client'
import SlideImage from './SlideImage'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{
    tags: string
  }>
  searchParams: Promise<{
    sort: string
    dir: string
  }>
}

const SlidePage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const search = params.tags
    ? decodeURIComponent(params.tags).toLowerCase().split(' ')
    : []

  const sort = searchParams.sort
  const sortDir = searchParams.dir == 'asc' ? 'asc' : 'desc'
  const query = search.map((tag: string) =>
    tag.charAt(0) !== '-'
      ? {
          tags: {
            some: {
              name: tag,
            },
          },
        }
      : {
          tags: {
            none: {
              name: tag.substring(1),
            },
          },
        },
  )
  const images = await prisma.image.findMany({
    orderBy: sort == 'hash' ? { hash: sortDir } : { uploaded: sortDir },
    where: {
      AND: query,
    },
  })

  if (images.length === 0) notFound()

  if (searchParams.sort == 'random') {
    return <SlideImage images={images.sort(() => Math.random() - 0.5)} />
  } else {
    return <SlideImage images={images} />
  }
}

export default SlidePage

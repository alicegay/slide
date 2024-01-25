import prisma from '@/prisma/client'
import SlideImage from './SlideImage'

interface Props {
  params: {
    tags: string
  }
  searchParams: {
    sort: string
    dir: string
  }
}

const SlidePage = async ({ params, searchParams }: Props) => {
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

  return <SlideImage images={images} />
}

export default SlidePage

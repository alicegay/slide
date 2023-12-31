import prisma from '@/prisma/client'
import Link from 'next/link'

interface Props {
  params: { tags: string }
}

const SearchPage = async ({ params }: Props) => {
  const search = params.tags
    ? String(params.tags).replaceAll('%20', ' ').toLowerCase().split(' ')
    : []

  const images = await prisma.image.findMany({
    take: 24,
    orderBy: {
      uploaded: 'desc',
    },
    where: {
      AND: search.map((tag: string) =>
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
      ),
    },
    include: {
      tags: true,
    },
  })

  return (
    <>
      {/* <div role="alert" className="alert alert-error mb-4">
        <span>No images found.</span>
      </div> */}

      {/* <div className="grid grid-cols-6 gap-4 mb-4">
        {[...Array(24)].map((e, i) => (
          <div className="skeleton w-auto h-40" key={i} />
        ))}
      </div> */}

      <div className="grid grid-cols-6 gap-4 mb-4">
        {images.map((image) => (
          <div
            key={image.hash}
            className="flex justify-center items-center thumbnail-image"
          >
            <Link href={'/view/' + image.hash} className="h-full">
              <img
                src={'/image/' + image.hash}
                className="h-full object-contain"
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="join flex justify-center mb-4">
        <button className="join-item btn btn-active">1</button>
        <button className="join-item btn">2</button>
        <button className="join-item btn">3</button>
        <button className="join-item btn">4</button>
        <button className="join-item btn btn-disabled">...</button>
        <button className="join-item btn">135</button>
      </div>

      <div className="flex justify-center">
        {images.length} image{images.length !== 1 && 's'}
      </div>
    </>
  )
}

export default SearchPage

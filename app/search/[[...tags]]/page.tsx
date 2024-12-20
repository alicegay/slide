import prisma from '@/prisma/client'
import Link from 'next/link'

interface Props {
  params: Promise<{
    tags: string
  }>
  searchParams: Promise<{
    page: number
    sort: string
    dir: string
  }>
}

const SearchPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const search = params.tags
    ? decodeURIComponent(params.tags).toLowerCase().split(' ')
    : []

  const sort = searchParams.sort
  const sortDir = searchParams.dir == 'asc' ? 'asc' : 'desc'
  const sortUrlAdd =
    (searchParams.sort ? '&sort=' + sort : '') +
    (searchParams.dir ? '&dir=' + sortDir : '')
  const page = searchParams.page ? Number(searchParams.page) : 1
  const pageAmount = 24
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
    take: pageAmount,
    skip: pageAmount * (page - 1),
    orderBy: sort == 'hash' ? { hash: sortDir } : { uploaded: sortDir },
    where: {
      AND: query,
    },
    include: {
      tags: true,
    },
  })
  const count = await prisma.image.count({
    where: {
      AND: query,
    },
  })
  const pageCount = Math.ceil(count / pageAmount)

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
                src={'/thumbnail/' + image.hash}
                className="h-full object-contain"
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="join flex justify-center mb-4">
        {page >= 4 && (
          <Link href={'?page=1' + sortUrlAdd} className="join-item btn">
            1
          </Link>
        )}
        {page >= 5 && <div className="join-item btn btn-disabled">...</div>}
        {page >= 3 && (
          <Link
            href={'?page=' + (page - 2) + sortUrlAdd}
            className="join-item btn"
          >
            {page - 2}
          </Link>
        )}
        {page >= 2 && (
          <Link
            href={'?page=' + (page - 1) + sortUrlAdd}
            className="join-item btn"
          >
            {page - 1}
          </Link>
        )}
        <Link
          href={'?page=' + page + sortUrlAdd}
          className="join-item btn btn-active"
        >
          {page}
        </Link>
        {page < pageCount - 1 && (
          <Link
            href={'?page=' + (page + 1) + sortUrlAdd}
            className="join-item btn"
          >
            {page + 1}
          </Link>
        )}
        {page < pageCount - 2 && (
          <Link
            href={'?page=' + (page + 2) + sortUrlAdd}
            className="join-item btn"
          >
            {page + 2}
          </Link>
        )}
        {page < pageCount - 3 && (
          <div className="join-item btn btn-disabled">...</div>
        )}
        {page < pageCount && (
          <Link
            href={'?page=' + pageCount + sortUrlAdd}
            className="join-item btn"
          >
            {pageCount}
          </Link>
        )}
      </div>

      <div className="flex justify-center">
        {count} image{count !== 1 && 's'}
      </div>
    </>
  )
}

export default SearchPage

import prisma from '@/prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    hash: string
  }
}

const ViewPage = async ({ params }: Props) => {
  const image = await prisma.image.findUnique({
    where: {
      hash: params.hash,
    },
    include: {
      tags: true,
    },
  })

  if (!image) return notFound()

  return (
    <div className="flex gap-x-4">
      <div className="flex flex-col gap-y-4 w-96">
        <div className="flex flex-col gap-y-2">
          <span className="text-sm">TAGS</span>
          {image.tags.map((tag) => (
            <Link
              className="btn btn-sm justify-start"
              href={'/search/' + tag.name}
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-y-2">
          <span className="text-sm">STATISTICS</span>
          {image.explicit ? (
            <Link
              className="btn btn-sm justify-start text-red-800"
              href="/search/r18"
            >
              Explicit
            </Link>
          ) : (
            <Link
              className="btn btn-sm justify-start text-green-600"
              href="/search/safe"
            >
              Safe
            </Link>
          )}
          <div className="btn btn-sm justify-start">
            {Math.round(image.filesize / 10.24) / 100 + ' KB ' + image.filetype}
          </div>
          <div className="btn btn-sm justify-start">
            {image.width + ' × ' + image.height}
          </div>
          {image.source && (
            <a
              className="btn btn-sm justify-start"
              href={image.source}
              target="_blank"
            >
              {image.source}
            </a>
          )}
        </div>
      </div>
      <div className="w-full">
        <img src={'/image/' + params.hash} />
      </div>
    </div>
  )
}

export default ViewPage

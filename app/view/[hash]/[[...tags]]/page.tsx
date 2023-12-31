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
      tags: { orderBy: { name: 'asc' } },
    },
  })

  if (!image) return notFound()

  const tagCount = await prisma.tag.findMany({
    where: {
      images: {
        some: {
          hash: params.hash,
        },
      },
    },
    include: {
      _count: {
        select: {
          images: true,
        },
      },
    },
  })

  let tagLengths = { TAG: 0, ARTIST: 0, CHARACTER: 0, SERIES: 0, INFO: 0 }
  image.tags.forEach((tag) => {
    if (tag.name !== 'safe' && tag.name !== 'explicit')
      tagLengths[tag.type] += 1
  })

  return (
    <div className="flex gap-x-4">
      <div className="flex flex-col gap-y-2 sidebar">
        {tagLengths.ARTIST > 0 && (
          <div className="flex flex-col gap-y-1">
            <span className="text-sm">ARTIST</span>
            {image.tags.map(
              (tag) =>
                tag.type === 'ARTIST' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between text-red-600"
                    href={'/search/' + tag.name}
                  >
                    <span>{tag.name.replaceAll('_', ' ')}</span>
                    <span className="text-slate-500">
                      {tagCount.find((e) => e.id === tag.id)?._count.images}
                    </span>
                  </Link>
                ),
            )}
          </div>
        )}
        {tagLengths.CHARACTER > 0 && (
          <div className="flex flex-col gap-y-1">
            <span className="text-sm">CHARACTERS</span>
            {image.tags.map(
              (tag) =>
                tag.type === 'CHARACTER' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between text-green-600"
                    href={'/search/' + tag.name}
                  >
                    <span>{tag.name.replaceAll('_', ' ')}</span>
                    <span className="text-slate-500">
                      {tagCount.find((e) => e.id === tag.id)?._count.images}
                    </span>
                  </Link>
                ),
            )}
          </div>
        )}
        {tagLengths.SERIES > 0 && (
          <div className="flex flex-col gap-y-1">
            <span className="text-sm">SERIES</span>
            {image.tags.map(
              (tag) =>
                tag.type === 'SERIES' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between text-violet-600"
                    href={'/search/' + tag.name}
                  >
                    <span>{tag.name.replaceAll('_', ' ')}</span>
                    <span className="text-slate-500">
                      {tagCount.find((e) => e.id === tag.id)?._count.images}
                    </span>
                  </Link>
                ),
            )}
          </div>
        )}
        {tagLengths.INFO > 0 && (
          <div className="flex flex-col gap-y-1">
            <span className="text-sm">INFO</span>
            {image.tags.map(
              (tag) =>
                tag.type === 'INFO' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between text-amber-600"
                    href={'/search/' + tag.name}
                  >
                    <span>{tag.name.replaceAll('_', ' ')}</span>
                    <span className="text-slate-500">
                      {tagCount.find((e) => e.id === tag.id)?._count.images}
                    </span>
                  </Link>
                ),
            )}
          </div>
        )}
        {tagLengths.TAG > 0 && (
          <div className="flex flex-col gap-y-1">
            <span className="text-sm">TAGS</span>
            {image.tags.map(
              (tag) =>
                tag.type === 'TAG' &&
                tag.name !== 'safe' &&
                tag.name !== 'explicit' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between"
                    href={'/search/' + tag.name}
                  >
                    <span>{tag.name.replaceAll('_', ' ')}</span>
                    <span className="text-slate-500">
                      {tagCount.find((e) => e.id === tag.id)?._count.images}
                    </span>
                  </Link>
                ),
            )}
          </div>
        )}
        <div className="flex flex-col gap-y-1">
          <span className="text-sm">STATISTICS</span>
          {image.tags.some((e) => e.name === 'safe') && (
            <Link
              className="btn btn-sm justify-between text-green-600"
              href="/search/safe"
            >
              <span>Safe</span>
              <span className="text-slate-500">
                {tagCount.find((e) => e.name === 'safe')?._count.images}
              </span>
            </Link>
          )}
          {image.tags.some((e) => e.name === 'explicit') && (
            <Link
              className="btn btn-sm justify-start text-red-600"
              href="/search/r18"
            >
              <span>Explicit</span>
              <span className="text-slate-500">
                {tagCount.find((e) => e.name === 'explicit')?._count.images}
              </span>
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
              className="btn btn-sm justify-start overflow-hidden"
              href={image.source}
              target="_blank"
            >
              {image.source}
            </a>
          )}
          <Link
            className="btn btn-sm justify-start text-amber-600"
            href={'/edit/' + params.hash}
          >
            Edit
          </Link>
        </div>
      </div>
      <div className="w-full view-image">
        <img src={'/image/' + params.hash} className="view-image" />
      </div>
    </div>
  )
}

export default ViewPage

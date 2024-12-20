import formatFilesize from '@/app/lib/formatFilesize'
import formatSource from '@/app/lib/formatSource'
import prisma from '@/prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{
    hash: string
  }>
}

const ViewPage = async (props: Props) => {
  const params = await props.params
  const image = await prisma.image.findUnique({
    where: {
      hash: params.hash,
    },
    include: {
      tags: { orderBy: { name: 'asc' } },
      parent: {
        include: {
          tags: { select: { name: true } },
          children: {
            orderBy: { uploaded: 'desc' },
            include: { tags: { select: { name: true } } },
          },
        },
      },
      children: {
        orderBy: { uploaded: 'desc' },
        include: { tags: { select: { name: true } } },
      },
    },
  })

  if (!image) return notFound()

  const explicit = image.tags.some((e) => e.name === 'explicit') ? true : false

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
                tag.type === 'ARTIST' &&
                tag.name !== 'safe' &&
                tag.name !== 'explicit' && (
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
                tag.type === 'CHARACTER' &&
                tag.name !== 'safe' &&
                tag.name !== 'explicit' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between flex-nowrap text-green-600"
                    href={'/search/' + tag.name}
                  >
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                      {tag.name.replaceAll('_', ' ')}
                    </span>
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
                tag.type === 'SERIES' &&
                tag.name !== 'safe' &&
                tag.name !== 'explicit' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between flex-nowrap text-violet-600"
                    href={'/search/' + tag.name}
                  >
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                      {tag.name.replaceAll('_', ' ')}
                    </span>
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
                tag.type === 'INFO' &&
                tag.name !== 'safe' &&
                tag.name !== 'explicit' && (
                  <Link
                    key={tag.id}
                    className="btn btn-sm justify-between flex-nowrap text-amber-600"
                    href={'/search/' + tag.name}
                  >
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                      {tag.name.replaceAll('_', ' ')}
                    </span>
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
                    className="btn btn-sm justify-between flex-nowrap"
                    href={'/search/' + tag.name}
                  >
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                      {tag.name.replaceAll('_', ' ')}
                    </span>
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
          {!explicit ? (
            <Link
              className="btn btn-sm justify-between text-green-600"
              href="/search/safe"
            >
              <span>Safe</span>
              <span className="text-slate-500">
                {tagCount.find((e) => e.name === 'safe')?._count.images}
              </span>
            </Link>
          ) : (
            <Link
              className="btn btn-sm justify-between text-red-600"
              href="/search/explicit"
            >
              <span>Explicit</span>
              <span className="text-slate-500">
                {tagCount.find((e) => e.name === 'explicit')?._count.images}
              </span>
            </Link>
          )}
          <div className="btn btn-sm justify-between">
            {formatFilesize(image.filesize) + ' ' + image.filetype}
          </div>
          <div className="btn btn-sm justify-between">
            {image.width + ' × ' + image.height}
          </div>
          {image.source && (
            <a
              className="btn btn-sm justify-between"
              href={image.source}
              target="_blank"
            >
              <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                {formatSource(image.source)}
              </span>
            </a>
          )}
          <Link
            className="btn btn-sm justify-between text-amber-600"
            href={'/edit/' + params.hash}
          >
            Edit
          </Link>
        </div>
      </div>
      <div className="w-full view-image">
        <img src={'/image/' + params.hash} className="view-image" />
      </div>
      {(image.parent ||
        image.children.length > 0 ||
        image.title ||
        image.description ||
        image.translation) && (
        <div className="flex flex-col gap-y-2 sidebar">
          {(image.title || image.description) && (
            <div className="card bg-base-200">
              <div className="card-body py-2 px-4">
                {image.title && <h2 className="card-title">{image.title}</h2>}
                {image.description && (
                  <p className="whitespace-pre-wrap">{image.description}</p>
                )}
              </div>
            </div>
          )}

          {image.translation && (
            <div className="card bg-base-200">
              <div className="card-body py-2 px-4 whitespace-pre-wrap">
                <p>{image.translation}</p>
              </div>
            </div>
          )}

          {image.parent && (
            <>
              <span className="text-sm">PARENT</span>
              <div className="card bg-base-200">
                <div className="card-body py-2 px-4 ">
                  <Link
                    className="flex thumbnail-image"
                    href={'/view/' + image.parent.hash}
                  >
                    <img
                      className={
                        'object-contain' +
                        (!explicit &&
                        image.parent.tags.some((e) => e.name === 'explicit')
                          ? ' blur-md hover:blur-none'
                          : '')
                      }
                      src={'/thumbnail/' + image.parent.hash}
                    />
                  </Link>
                </div>
              </div>
            </>
          )}

          {image.children.length > 0 && (
            <>
              <span className="text-sm">CHILDREN</span>
              {image.children.map((child) => (
                <div key={child.hash} className="card bg-base-200">
                  <div className="card-body py-2 px-4 ">
                    <Link
                      className="flex thumbnail-image"
                      href={'/view/' + child.hash}
                    >
                      <img
                        className={
                          'object-contain' +
                          (!explicit &&
                          child.tags.some((e) => e.name === 'explicit')
                            ? ' blur-md hover:blur-none'
                            : '')
                        }
                        src={'/thumbnail/' + child.hash}
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}

          {image.parent && image.parent.children.length > 1 && (
            <>
              <span className="text-sm">SIBLINGS</span>
              {image.parent.children
                .filter((child) => child.hash !== params.hash)
                .map((child) => (
                  <div key={child.hash} className="card bg-base-200">
                    <div className="card-body py-2 px-4 ">
                      <Link
                        className="flex thumbnail-image"
                        href={'/view/' + child.hash}
                      >
                        <img
                          className={
                            'object-contain' +
                            (!explicit &&
                            child.tags.some((e) => e.name === 'explicit')
                              ? ' blur-md hover:blur-none'
                              : '')
                          }
                          src={'/thumbnail/' + child.hash}
                        />
                      </Link>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ViewPage

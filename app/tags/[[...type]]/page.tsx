import prisma from '@/prisma/client'
import { TagType } from '@prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const tagMap: Record<TagType, { label: string; color: string }> = {
  TAG: { label: 'Tag', color: 'bg-slate-600' },
  ARTIST: { label: 'Artist', color: 'bg-red-600' },
  SERIES: { label: 'Series', color: 'bg-violet-600' },
  CHARACTER: { label: 'Character', color: 'bg-green-600' },
  INFO: { label: 'Info', color: 'bg-amber-600' },
}

interface Props {
  params: {
    type?: TagType
  }
}

const TagsPage = async ({ params }: Props) => {
  const type = params.type
    ? (String(params.type).toUpperCase() as TagType)
    : null
  if (type && !(type in tagMap)) notFound()

  const tags = await prisma.tag.findMany({
    where: type ? { type: type } : {},
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { images: true },
      },
    },
  })

  return (
    <div className="flex flex-col gap-y-4">
      <div role="tablist" className="tabs tabs-boxed">
        <Link
          href="/tags/"
          role="tab"
          className={'tab' + (!type ? ' tab-active' : '')}
        >
          All
        </Link>
        <Link
          href="/tags/tag"
          role="tab"
          className={'tab' + (type === 'TAG' ? ' tab-active' : '')}
        >
          Tags
        </Link>
        <Link
          href="/tags/artist"
          role="tab"
          className={'tab' + (type === 'ARTIST' ? ' tab-active' : '')}
        >
          Artists
        </Link>
        <Link
          href="/tags/series"
          role="tab"
          className={'tab' + (type === 'SERIES' ? ' tab-active' : '')}
        >
          Series
        </Link>
        <Link
          href="/tags/character"
          role="tab"
          className={'tab' + (type === 'CHARACTER' ? ' tab-active' : '')}
        >
          Characters
        </Link>
        <Link
          href="/tags/info"
          role="tab"
          className={'tab' + (type === 'INFO' ? ' tab-active' : '')}
        >
          Info
        </Link>

        <Link href="/tags/new" role="tab" className={'tab'}>
          New Tag
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>
                  <Link
                    className="link link-hover"
                    href={'/search/' + tag.name}
                  >
                    {tag.name}
                  </Link>
                  <span className="badge bg-slate-600 ml-2">
                    {tag._count.images}
                  </span>
                </td>
                <td>
                  <span className={'badge ' + tagMap[tag.type].color}>
                    {tagMap[tag.type].label}
                  </span>
                </td>
                <td>
                  <Link
                    className="btn btn-ghost btn-xs mr-2"
                    href={'/tags/edit/' + tag.name}
                    prefetch={false}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TagsPage

import prisma from '@/prisma/client'
import { TagType } from '@prisma/client'
import Link from 'next/link'

const tagMap: Record<TagType, { label: string; color: string }> = {
  TAG: { label: 'Tag', color: 'bg-slate-600' },
  ARTIST: { label: 'Artist', color: 'bg-red-800' },
  SERIES: { label: 'Series', color: 'bg-violet-600' },
  CHARACTER: { label: 'Character', color: 'bg-green-600' },
  INFO: { label: 'Info', color: 'bg-amber-600' },
}

interface Props {
  searchParams: {
    type?: TagType
  }
}

const TagsPage = async ({ searchParams }: Props) => {
  const tags = await prisma.tag.findMany({
    take: 100,
    where: { type: searchParams.type?.toUpperCase() as TagType },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div role="tablist" className="tabs tabs-boxed">
        <Link href="?" role="tab" className="tab tab-active">
          All
        </Link>
        <Link href="?type=tag" role="tab" className="tab">
          Tags
        </Link>
        <Link href="?type=artist" role="tab" className="tab">
          Artists
        </Link>
        <Link href="?type=series" role="tab" className="tab">
          Series
        </Link>
        <Link href="?type=character" role="tab" className="tab">
          Characters
        </Link>
        <Link href="?type=info" role="tab" className="tab">
          Info
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
                  <span className="badge bg-slate-600 ml-2">0</span>
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
                  <button className="btn btn-ghost btn-xs">Delete</button>
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

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'

enum Sort {
  UPLOADED,
  HASH,
}
enum SortDirection {
  DESC,
  ASC,
}
const sortMap: Record<Sort, string> = {
  0: 'Uploaded',
  1: 'Hash',
}
const sortArray = [Sort.UPLOADED, Sort.HASH]

const NavBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ tags: string }>()
  const urlTags = params.tags
    ? String(params.tags).replaceAll('%20', ' ')
    : null

  const [tags, setTags] = useState<string>()
  const [sort, setSort] = useState<Sort>(Sort.UPLOADED)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.DESC,
  )

  useEffect(() => {
    if (urlTags) setTags(urlTags)
  }, [pathname, params])

  return (
    <div className="navbar bg-primary">
      <div className="flex-none mr-2">
        <Link href="/" className="btn btn-ghost text-xl">
          SLIDE
        </Link>
        <Link href="/upload" className="btn btn-ghost">
          Upload
        </Link>
        <Link href="/tags" className="btn btn-ghost">
          Tags
        </Link>
        <Link href="/similar" className="btn btn-ghost">
          Similar
        </Link>
      </div>
      <div className="flex-1 gap-2">
        <div className="flex w-full join">
          <input
            type="text"
            placeholder="Search tags"
            className="input input-bordered bg-slate-200 text-slate-800 w-full join-item"
            value={tags}
            onChange={(e) => {
              setTags(e.currentTarget.value)
            }}
          />
          <div className="dropdown dropdown-end join-item">
            <div tabIndex={0} className="btn join-item w-40">
              {sortMap[sort] + ' '}
              {sortDirection == SortDirection.DESC ? (
                <MdExpandMore />
              ) : (
                <MdExpandLess />
              )}
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-40"
            >
              {sortArray.map((s) => (
                <li>
                  <div
                    onClick={() => {
                      if (sort === s)
                        setSortDirection(
                          sortDirection === SortDirection.DESC
                            ? SortDirection.ASC
                            : SortDirection.DESC,
                        )
                      setSort(s)
                    }}
                  >
                    {sortMap[s]}{' '}
                    {sortDirection === SortDirection.DESC ? (
                      <MdExpandLess />
                    ) : (
                      <MdExpandMore />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          onClick={() => {
            let sortUrl = ''
            if (sort !== Sort.UPLOADED && sortDirection !== SortDirection.DESC)
              sortUrl = '?sort=' + sortMap[sort].toLowerCase() + '&dir=asc'
            else if (sort !== Sort.UPLOADED)
              sortUrl = '?sort=' + sortMap[sort].toLowerCase()
            else if (sortDirection !== SortDirection.DESC) sortUrl = '?dir=asc'
            router.push('/search/' + tags + sortUrl)
          }}
          className="btn btn-ghost"
        >
          Search
        </div>
        <div onClick={() => {}} className="btn btn-ghost">
          Slideshow
        </div>
      </div>
    </div>
  )
}

export default NavBar

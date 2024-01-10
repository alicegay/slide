'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import sortRelevantTags from './lib/sortRelevantTags'

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

interface Props {
  tags: string[]
}

const NavBar = ({ tags: allTags }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ tags: string }>()
  const urlTags = params.tags ? decodeURIComponent(params.tags) : null

  const tagAmount = 8

  const [tags, setTags] = useState<string>('')
  const [lastTag, setLastTag] = useState<string>('')
  const [minusTag, setMinusTag] = useState(false)
  const [sort, setSort] = useState<Sort>(Sort.UPLOADED)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.DESC,
  )

  const searchRef = useRef<HTMLInputElement>(null)
  const suRef = [...Array(tagAmount)].map(() => useRef<HTMLDivElement>(null))

  useEffect(() => {
    if (urlTags) setTags(urlTags)
  }, [pathname, params])

  useEffect(() => {
    if (tags) {
      const t = tags.split(' ')[tags.split(' ').length - 1]
      if (t[0] !== '-') {
        setLastTag(t)
        setMinusTag(false)
      } else {
        setLastTag(t.slice(1))
        setMinusTag(true)
      }
    } else setLastTag('')
  }, [tags])

  const updateLastTag = (tag: string) => {
    const sp = tags!.split(' ')
    const sl = sp.slice(0, sp.length - 1)
    if (minusTag) setTags([...sl, '-' + tag].join(' ') + ' ')
    else setTags([...sl, tag].join(' ') + ' ')
  }

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
          <div className="dropdown w-full join-item">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search tags"
              className="input input-bordered bg-slate-200 text-slate-800 w-full join-item"
              value={tags}
              onChange={(e) => {
                setTags(e.currentTarget.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  suRef[0].current?.focus()
                }
              }}
            />
            {lastTag.length >= 3 && (
              <ul className="absolute z-[1] menu p-2 shadow bg-base-300 rounded-box">
                {sortRelevantTags(
                  lastTag,
                  allTags.filter((tag) => tag.includes(lastTag)),
                )
                  .slice(0, tagAmount)
                  .map((tag, i, a) => (
                    <li key={i}>
                      <div
                        ref={suRef[i]}
                        tabIndex={0}
                        onClick={() => {
                          updateLastTag(tag)
                          searchRef.current!.select()
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateLastTag(tag)
                            searchRef.current!.select()
                          } else if (e.key === 'ArrowDown') {
                            const r = i >= a.length - 1 ? 0 : i + 1
                            suRef[r].current?.focus()
                          } else if (e.key === 'ArrowUp') {
                            const r = i <= 0 ? a.length - 1 : i - 1
                            suRef[r].current?.focus()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            searchRef.current!.select()
                            searchRef.current!.setSelectionRange(
                              tags!.length,
                              tags!.length,
                            )
                          } else if (e.key === 'Backspace') {
                            e.preventDefault()
                            searchRef.current!.select()
                            searchRef.current!.setSelectionRange(
                              tags!.length - lastTag.length,
                              tags!.length,
                            )
                          }
                        }}
                      >
                        {tag}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
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
              {sortArray.map((s, i) => (
                <li key={i}>
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

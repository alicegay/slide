'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

const NavBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ tags: string }>()
  const urlTags = params.tags
    ? String(params.tags).replaceAll('%20', ' ')
    : null

  const [tags, setTags] = useState<string>()

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
        <input
          type="text"
          placeholder="Search tags"
          className="input input-bordered bg-slate-200 text-slate-800 w-full"
          value={tags}
          onChange={(e) => {
            setTags(e.currentTarget.value)
          }}
        />
        <div
          onClick={() => {
            router.push('/search/' + tags)
          }}
          className="btn btn-ghost"
        >
          Search
        </div>
        <button onClick={() => {}} className="btn btn-ghost">
          Slideshow
        </button>
      </div>
    </div>
  )
}

export default NavBar

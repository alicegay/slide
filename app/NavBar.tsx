'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const NavBar = () => {
  const params = useParams()

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
          value={params.tags}
        />
        <button onClick={() => {}} className="btn btn-ghost">
          Search
        </button>
        <button onClick={() => {}} className="btn btn-ghost">
          Slideshow
        </button>
      </div>
    </div>
  )
}

export default NavBar
